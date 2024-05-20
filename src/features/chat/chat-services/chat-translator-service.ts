import createClient, { ErrorResponseOutput, TranslatedTextItemOutput } from "@azure-rest/ai-translation-text"

import { ServerActionResponseAsync } from "@/features/common/server-action-response"

export const extractCitations = (context: string): { text: string; citations: string[] } => {
  const citationRegex = /({% citation items=.*?)%}/g
  const citations: string[] = []
  let cleanText = context.replace(citationRegex, (match, citation) => {
    citations.push(citation.trim())
    return match
  })
  cleanText = cleanText.replace(/{% citation items=.*?%}/g, "").trim()
  return { text: cleanText, citations }
}

export async function translator(input: string): ServerActionResponseAsync<string> {
  try {
    // Extract code blocks from the input text
    const codeBlocks: string[] = []
    const processedText = input.replace(/(```[\s\S]*?```)/g, match => {
      codeBlocks.push(match)
      return `__codeblock_${codeBlocks.length - 1}__`
    })

    // Translate the text
    const translatedTexts = await translateFunction([{ text: processedText.toLowerCase() }], "en-GB", "en-US")

    // Revert the case of the translated text
    const revertedText = translatedTexts.length <= 0 ? processedText : revertCase(processedText, translatedTexts[0])

    // Replace the code blocks back to the original text
    const result = codeBlocks.reduce(
      (acc, codeBlock, index) => acc.replace(`__codeblock_${index}__`, `${codeBlock}`),
      revertedText
    )

    return { status: "OK", response: result }
  } catch (error) {
    console.error(error)
    return { status: "ERROR", errors: [{ message: "Translation failed" }] }
  }
}

async function translateFunction(
  inputText: { text: string }[],
  translatedTo: string,
  translatedFrom: string
): Promise<string[]> {
  const apiKey = process.env.APIM_KEY
  const endpoint = process.env.APIM_BASE + "/translator/text/v3.0"
  const region = process.env.REGION_NAME

  if (!apiKey || !endpoint || !region) {
    throw new Error("Missing configuration for Azure Translator.")
  }

  const translateCredential = { key: apiKey, region }
  const translationClient = createClient(endpoint, translateCredential)

  const translateResponse = await translationClient.path("/translate").post({
    body: inputText,
    queryParameters: { to: translatedTo, from: translatedFrom },
    headers: { "api-key": apiKey },
  })

  const translations = translateResponse.body as TranslatedTextItemOutput[] | ErrorResponseOutput

  if (Array.isArray(translations)) {
    return translations.map(translation => translation.translations[0].text)
  }
  throw new Error("Translation API returned an error response.")
}

export function revertCase(originalText: string, translatedText: string): string {
  const originalWords = originalText.split(/\b/)
  const translatedWords = translatedText.split(/\b/)
  let result = ""
  let wordIndex = 0

  while (wordIndex < translatedWords.length) {
    const originalWord = originalWords[wordIndex] || ""
    const translatedWord = translatedWords[wordIndex]
    wordIndex++

    const isUpperWord = /^[A-Z]*$/.test(originalWord)
    if (isUpperWord) {
      result += translatedWord.toUpperCase()
      continue
    }

    let word = ""
    for (let index = 0; index < translatedWord.length; index++) {
      const originalChar = originalWord.charAt(index)
      const translatedChar = translatedWord[index]

      // not working
      const skipPatterns = ["`"]

      if (skipPatterns.includes(originalWord)) {
        result += originalWord
        continue
      }
      // end of not working

      let isUpperChar = false
      isUpperChar = /[A-Z]/.test(originalChar) || isUpperChar
      word += isUpperChar ? translatedChar.toUpperCase() : translatedChar
    }

    result += word
  }

  return result
}

export function revertCaseOld(originalText: string, translatedText: string): string {
  const originalWords = originalText.split(/\b/)
  const translatedWords = translatedText.split(/\b/)
  let originalIndex = 0
  const result = translatedWords
    .map(translatedWord => {
      const originalWord = originalWords[originalIndex] || ""
      originalIndex++

      return [...translatedWord]
        .map((char, index) => {
          const originalChar = originalWord.charAt(index)
          return originalChar && originalChar.match(/[A-Z]/) ? char.toUpperCase() : char
        })
        .join("")
    })
    .join("")
  return result
}
