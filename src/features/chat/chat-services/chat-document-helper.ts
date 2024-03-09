"use server"
import "server-only"

export async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const binary = new Uint8Array(buffer)
  let base64String = ""
  for (let i = 0; i < binary.length; i++) {
    base64String += String.fromCharCode(binary[i])
  }
  return btoa(base64String)
}

interface AnalyzeDocumentResult {
  status: string
  analyzeResult: {
    version: string
    readResults: Array<unknown>
    pageResults?: Array<unknown>
  }
}

interface DocumentIntelligenceObject {
  analyzeDocumentUrl: string
  analyzeResultUrl: string | undefined
  diHeaders: HeadersInit
}

export const customDocumentIntelligenceObject = (modelId?: string, resultId?: string): DocumentIntelligenceObject => {
  const apiVersion = "2023-07-31"
  const analyzeDocumentUrl = `${process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT}/formrecognizer/documentModels/${modelId}:analyze?api-version=${apiVersion}&locale=en-GB`
  const analyzeResultUrl = resultId
    ? `${process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT}/formrecognizer/documentModels/${modelId}/analyzeResults/${resultId}?api-version=${apiVersion}`
    : undefined
  const diHeaders = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
  }
  return {
    analyzeDocumentUrl,
    analyzeResultUrl,
    diHeaders,
  }
}

export async function customBeginAnalyzeDocument(
  modelId: string,
  source: string,
  sourceType: "base64" | "url"
): Promise<AnalyzeDocumentResult> {
  const diParam = customDocumentIntelligenceObject(modelId)
  const analyzeDocumentUrl = diParam.analyzeDocumentUrl
  const analyzeDocumentHeaders = diParam.diHeaders
  const analyzeDocumentBody = sourceType === "base64" ? { base64Source: source } : { urlSource: source }

  const response = await fetch(analyzeDocumentUrl, {
    method: "POST",
    headers: analyzeDocumentHeaders,
    body: JSON.stringify(analyzeDocumentBody),
  })

  if (!response.ok) {
    throw new Error(`Failed to analyze document. ${response.statusText}`)
  }

  const resultId = response.headers.get("apim-request-id")

  if (resultId) {
    return await customGetAnalyzeResult(modelId, resultId)
  }

  throw new Error(`Failed to get Result ID. Status: ${response.status}`)
}

async function customGetAnalyzeResult(modelId: string, resultId: string): Promise<AnalyzeDocumentResult> {
  const diParam = customDocumentIntelligenceObject(modelId, resultId)
  const analyzeResultUrl = diParam.analyzeResultUrl
  if (!analyzeResultUrl) {
    throw new Error("analyzeResultUrl is undefined")
  }
  const analyzeDocumentHeaders = diParam.diHeaders

  try {
    let operationStatus: string = ""
    let analyzedResult: AnalyzeDocumentResult["analyzeResult"] = {
      version: "",
      readResults: [],
      pageResults: [],
    }

    while (!operationStatus || operationStatus !== "succeeded") {
      const response = await fetch(analyzeResultUrl, {
        method: "GET",
        headers: analyzeDocumentHeaders,
      })

      if (!response.ok) {
        throw new Error("Failed to fetch result." + (await response.json()))
      }

      const responseBody = await response.json()

      operationStatus = responseBody.status

      if (operationStatus === "succeeded") {
        analyzedResult = responseBody.analyzeResult
        break
      }

      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    return {
      status: operationStatus,
      analyzeResult: analyzedResult,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
