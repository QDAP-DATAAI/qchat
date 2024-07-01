import {
  Document,
  Paragraph,
  Packer,
  TextRun,
  HeadingLevel,
  IStylesOptions,
  INumberingOptions,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx"
import { IPropertiesOptions } from "docx/build/file/core-properties/properties"
import { saveAs } from "file-saver"
import { marked } from "marked"

import { showError, showSuccess } from "@/features/globals/global-message-store"

interface MessageType {
  role: string
  content: string
}

interface TranscriptType {
  details: string
}

const numbering: INumberingOptions = {
  config: [
    {
      reference: "myDecimal",
      levels: [
        {
          level: 0,
          format: "decimal",
          text: "%1.",
          alignment: "left",
          style: {
            paragraph: {
              indent: { left: 720, hanging: 260 },
            },
          },
        },
      ],
    },
  ],
}

const customStyles: IStylesOptions = {
  paragraphStyles: [
    {
      id: "MyCustomHeading1",
      name: "My Custom Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        size: 28,
        bold: true,
        font: "Aptos",
        color: "2E74B5",
      },
      paragraph: {
        spacing: { after: 240 },
      },
    },
    {
      id: "MyCustomParagraph",
      name: "My Custom Paragraph",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        size: 22,
        font: "Aptos",
      },
    },
    {
      id: "MyCustomCode",
      name: "My Custom Code Block",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: "Aptos",
        size: 20,
        color: "006633",
      },
      paragraph: {
        spacing: { after: 120 },
      },
    },
    {
      id: "MyCustomList",
      name: "My Custom List Item",
      basedOn: "MsoListParagraph",
      next: "Normal",
      quickFormat: true,
      run: {
        font: "Aptos",
        size: 18,
      },
      paragraph: {
        spacing: { after: 30 },
        numbering: {
          reference: "myDecimal",
          level: 0,
        },
      },
    },
  ],
  characterStyles: [
    {
      id: "MyCustomBoldText",
      name: "My Custom Bold Text",
      basedOn: "DefaultParagraphFont",
      run: {
        bold: true,
        size: 24,
      },
    },
  ],
}

class CustomRenderer extends marked.Renderer {
  paragraph(text: string): string {
    return `<p>${text}</p>`
  }

  strong(text: string): string {
    return `<strong>${text}</strong>`
  }

  em(text: string): string {
    return `<em>${text}</em>`
  }

  heading(text: string, level: number): string {
    return `<h${level}>${text}</h${level}>`
  }

  link(href: string, title: string | null | undefined, text: string): string {
    return `<a href="${href}" title="${title || ""}">${text}</a>`
  }

  image(href: string, title: string | null, text: string): string {
    return `<img src="${href}" alt="${text}" title="${title || ""}" />`
  }

  list(body: string, ordered: boolean): string {
    const tag = ordered ? "ol" : "ul"
    return `<${tag}>${body}</${tag}>`
  }

  listitem(text: string): string {
    return `<li>${text}</li>`
  }

  blockquote(quote: string): string {
    return `<blockquote>${quote}</blockquote>`
  }

  code(code: string, _infostring: string | undefined, escaped: boolean): string {
    return `<pre><code>${escaped ? code : this.escape(code)}</code></pre>`
  }

  codespan(text: string): string {
    return `<code>${text}</code>`
  }

  br(): string {
    return "<br />"
  }

  private escape(code: string): string {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  del(text: string): string {
    return `<del>${text}</del>`
  }
}

const createParagraphFromHtml = (html: string): Paragraph[] => {
  const paragraphs: Paragraph[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const processNode = (node: ChildNode): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      let para: Paragraph

      if (element.tagName === "PRE") {
        const codeElement = element.querySelector("code")
        if (codeElement) {
          const codeText = codeElement.textContent || "" // Ensuring text content is not null
          para = new Paragraph({
            text: codeText.trim(),
            style: "MyCustomCode", // Custom style for code
          })
          paragraphs.push(para)
          return // Skip further processing to avoid treating code as list items
        }
      }

      // Process non-code elements
      const textContentTrimmed = element.textContent?.trim() ?? ""
      if (textContentTrimmed) {
        switch (element.tagName) {
          case "P":
            para = new Paragraph({
              text: textContentTrimmed,
              style: "MyCustomParagraph",
            })
            paragraphs.push(para)
            break
          case "STRONG":
            para = new Paragraph({
              children: [new TextRun({ text: textContentTrimmed, bold: true })],
              style: "MyCustomParagraph",
            })
            paragraphs.push(para)
            break
          case "EM":
            para = new Paragraph({
              children: [new TextRun({ text: textContentTrimmed, italics: true })],
              style: "MyCustomParagraph",
            })
            paragraphs.push(para)
            break
          case "LI":
            para = new Paragraph({
              children: [new TextRun({ text: textContentTrimmed })],
              bullet: { level: 0 },
              style: "MyCustomList",
            })
            paragraphs.push(para)
            break
          case "BLOCKQUOTE":
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: textContentTrimmed, bold: true })],
                indent: { left: 720 },
              })
            )
            break
          // Add cases for H1-H6, OL, UL, BLOCKQUOTE as needed
          default:
            if (element.tagName.startsWith("H") && element.tagName.length === 2) {
              para = new Paragraph({
                text: textContentTrimmed,
                heading: HeadingLevel[`HEADING_${element.tagName.charAt(1)}` as keyof typeof HeadingLevel],
              })
              paragraphs.push(para)
            } else if (element.tagName === "OL" || element.tagName === "UL") {
              Array.from(element.children).forEach(child => processNode(child)) // Recursively process list items
            }
            break
        }
      }
    }
  }

  Array.from(doc.body.children).forEach(processNode)
  return paragraphs
}

const createTranscriptTable = (transcripts: TranscriptType[]): Table => {
  const rows = transcripts
    .map(transcript => {
      const detailsParagraphs = transcript.details
        .split("\n\n")
        .flatMap(paragraph => {
          return paragraph.split("\n").map(line => [
            new Paragraph({
              children: [
                new TextRun({ text: "Offender Contact ", bold: true }),
                new TextRun({ text: line.replace("Offender Contact ", "") }),
                new TextRun({ text: "\n" }),
              ],
            }),
          ])
        })
        .flat()

      return [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Date: ", bold: true }), new TextRun("PLACEHOLDER")],
                  style: "MyCustomParagraph",
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Time: ", bold: true }), new TextRun("PLACEHOLDER")],
                  style: "MyCustomParagraph",
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "PH #: ", bold: true }), new TextRun("PLACEHOLDER")],
                  style: "MyCustomParagraph",
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "ADL Listed Holder: ", bold: true }), new TextRun("PLACEHOLDER")],
                  style: "MyCustomParagraph",
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Identified Holder: ", bold: true }), new TextRun("PLACEHOLDER")],
                  style: "MyCustomParagraph",
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Details: ", bold: true }), ...detailsParagraphs.flatMap(p => p)],
                  style: "MyCustomParagraph",
                }),
              ],
            }),
          ],
        }),
      ]
    })
    .flat()

  return new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

export const convertMarkdownToWordDocument = async (
  messages: MessageType[],
  fileName: string,
  aiName: string,
  userName: string,
  chatThreadName: string
): Promise<void> => {
  const messageParagraphPromises = messages.map(async message => {
    const author = message.role === "system" || message.role === "assistant" ? aiName : userName
    const authorParagraph = new Paragraph({
      text: `${author}:`,
      heading: HeadingLevel.HEADING_2,
      style: "MyCustomHeading1",
    })

    const processedContent = processCitationsInText(message.content)
    const content = await marked.parse(processedContent)
    const contentParagraphs = createParagraphFromHtml(content)

    return [authorParagraph, ...contentParagraphs, new Paragraph({ style: "MyCustomParagraph" })]
  })

  await convertParagraphsToWordDocument(messageParagraphPromises, fileName, aiName, chatThreadName)
}

export const convertTranscriptionReportToWordDocument = async (
  transcriptions: string[],
  audioFileName: string,
  saveFileName: string,
  aiName: string,
  chatThreadName: string
): Promise<void> => {
  const messageParagraphPromises = transcriptions.map(transcription => {
    const speaker = "Offender Contact"
    const authorParagraph = new Paragraph({
      text: `${audioFileName}:`,
      heading: HeadingLevel.HEADING_2,
      style: "MyCustomHeading1",
    })

    const paragraphs = transcription
      .split("\n\n")
      .flatMap(paragraph => paragraph.split("\n").map(line => `${speaker}: ${line}`))

    const contentParagraphs = paragraphs.map(line => {
      const textRun = new TextRun({
        text: line.replace("Offender Contact ", ""),
      })

      return new Paragraph({
        children: [textRun],
        style: "MyCustomParagraph",
      })
    })

    return [authorParagraph, ...contentParagraphs, new Paragraph({ style: "MyCustomParagraph" })]
  })

  const messageParagraphs = await Promise.all(messageParagraphPromises)

  await convertParagraphsToWordDocument(
    [Promise.resolve(messageParagraphs.flat())],
    saveFileName,
    aiName,
    chatThreadName
  )
}

export const convertTranscriptionToWordDocument = async (
  transcriptions: string[],
  saveFileName: string
): Promise<void> => {
  const transcriptObjects = transcriptions.map(details => ({ details }))

  const doc = new Document({
    sections: [
      {
        children: [createTranscriptTable(transcriptObjects)],
      },
    ],
  })

  Packer.toBlob(doc)
    .then(blob => {
      saveAs(blob, saveFileName)
      showSuccess({
        title: "Success",
        description: "Transcriptions exported to Word document",
      })
    })
    .catch(error => {
      showError("Failed to export transcriptions to Word document" + error)
    })
}

const convertParagraphsToWordDocument = async (
  paragraphs: Promise<Paragraph[]>[],
  fileName: string,
  aiName: string,
  chatThreadName: string
): Promise<void> => {
  const renderer = new CustomRenderer()
  marked.use({ renderer })

  const coreProperties: IPropertiesOptions = {
    title: chatThreadName,
    subject: chatThreadName,
    creator: aiName,
    lastModifiedBy: aiName,
    numbering: numbering,
    sections: [],
  }

  const messageParagraphs = (await Promise.all(paragraphs)).flat()

  const doc = new Document({
    numbering: numbering,
    styles: customStyles,
    title: coreProperties.title,
    subject: coreProperties.subject,
    creator: coreProperties.creator,
    lastModifiedBy: coreProperties.lastModifiedBy,
    sections: [{ children: messageParagraphs }],
  })

  Packer.toBlob(doc)
    .then(blob => {
      saveAs(blob, fileName)
      showSuccess({
        title: "Success",
        description: "Chat exported to Word document",
      })
    })
    .catch(() => {
      showError("Failed to export chat to Word document")
    })
}

const processCitationsInText = (text: string): string => {
  const citationPattern = /{% citation[^\n]*/g
  const processedText = text.replace(citationPattern, "-- References were removed for privacy reasons --")
  return processedText
}
