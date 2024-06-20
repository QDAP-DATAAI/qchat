import { AzureKeyCredential } from "@azure/core-auth"
import {
  TextCategoriesAnalysisOutput as OriginalTextCategoriesAnalysisOutput,
  AnalyzeTextParameters,
  AnalyzeImageParameters,
  isUnexpected,
  ContentSafetyClient,
} from "@azure-rest/ai-content-safety"
import createClient from "@azure-rest/ai-content-safety"
import {
  Angry,
  EqualNot,
  Milestone,
  Siren,
  HandHelping,
  ShieldX,
  Scale,
  Blend,
  Heart,
  Award,
  MapPinOff,
} from "lucide-react"

import logger from "@/features/insights/app-insights"

// Define the categories as an enum
export enum ContentSafetyCategory {
  Hate = "Hate",
  SelfHarm = "SelfHarm",
  SexualContent = "Sexual",
  Violence = "Violence",
  Ethical = "ethical",
  Impartial = "impartial",
  Fairness = "fairness",
  Transparency = "transparency",
  Empathy = "empathy",
  Accountability = "accountability",
  LocalRelevance = "localRelevance",
}

export interface QGovTextCategoriesAnalysisOutput extends OriginalTextCategoriesAnalysisOutput {
  categories: Array<{
    category: ContentSafetyCategory
    severity?: number
  }>
  category: ContentSafetyCategory
}

export class QGovCustomTextAnalysis implements QGovTextCategoriesAnalysisOutput {
  categories: Array<{
    category: ContentSafetyCategory
    severity?: number
  }>
  category: ContentSafetyCategory

  constructor(categories: Array<{ category: ContentSafetyCategory; severity?: number }>) {
    this.categories = categories
    this.category = this.determineMainCategory()
  }

  private determineMainCategory(): ContentSafetyCategory {
    // Logic to determine the main category based on severity
    if (this.categories.length > 0) {
      return this.categories.reduce((prev, curr) => ((curr.severity || 0) > (prev.severity || 0) ? curr : prev))
        .category
    }
    return ContentSafetyCategory.Hate // Default category if none found
  }

  generateMessage(): string {
    return this.categories.map(cat => `This message may ${categorySeverityMessageMap[cat.category]};`).join(" ")
  }
}

export const categoryIconMap: Record<ContentSafetyCategory, React.ElementType> = {
  [ContentSafetyCategory.Hate]: Angry,
  [ContentSafetyCategory.SexualContent]: Milestone,
  [ContentSafetyCategory.Violence]: Siren,
  [ContentSafetyCategory.SelfHarm]: HandHelping,
  [ContentSafetyCategory.Ethical]: ShieldX,
  [ContentSafetyCategory.Impartial]: EqualNot,
  [ContentSafetyCategory.Fairness]: Scale,
  [ContentSafetyCategory.Transparency]: Blend,
  [ContentSafetyCategory.Empathy]: Heart,
  [ContentSafetyCategory.Accountability]: Award,
  [ContentSafetyCategory.LocalRelevance]: MapPinOff,
}

export const categorySeverityMap: Record<ContentSafetyCategory, number> = {
  [ContentSafetyCategory.Hate]: 10,
  [ContentSafetyCategory.SexualContent]: 9,
  [ContentSafetyCategory.Violence]: 8,
  [ContentSafetyCategory.SelfHarm]: 7,
  [ContentSafetyCategory.Ethical]: 6,
  [ContentSafetyCategory.Impartial]: 5,
  [ContentSafetyCategory.Fairness]: 4,
  [ContentSafetyCategory.Transparency]: 3,
  [ContentSafetyCategory.Empathy]: 2,
  [ContentSafetyCategory.Accountability]: 1,
  [ContentSafetyCategory.LocalRelevance]: 0,
}

export const categorySeverityMessageMap: Record<ContentSafetyCategory, string> = {
  [ContentSafetyCategory.Hate]: "contain hate speech",
  [ContentSafetyCategory.SexualContent]: "contain sexual content",
  [ContentSafetyCategory.Violence]: "contain violent content",
  [ContentSafetyCategory.SelfHarm]:
    "contain self-harm content; remember that support services are available. If you are in danger please call 000 or Lifeline on 13 11 14. Otherwise, please reach out to a trusted friend, colleague, or Employee Assistance Program (EAP) for support.",
  [ContentSafetyCategory.Ethical]: "contain unethical content",
  [ContentSafetyCategory.Impartial]: "lack impartiality",
  [ContentSafetyCategory.Fairness]: "contain unfair content",
  [ContentSafetyCategory.Transparency]: "lack transparency",
  [ContentSafetyCategory.Empathy]: "lack empathy",
  [ContentSafetyCategory.Accountability]: "lack accountability",
  [ContentSafetyCategory.LocalRelevance]: "not be aligned with the Queensland context",
}

async function analyzeContentSafety(
  endpoint: string,
  credential: AzureKeyCredential,
  content: string | { content: string; blobUrl?: string },
  categories: string[],
  contentType: "text" | "image"
): Promise<QGovTextCategoriesAnalysisOutput | null> {
  const client = createClient(endpoint, credential) as ContentSafetyClient

  try {
    if (contentType === "text") {
      const analyzeTextParameters: AnalyzeTextParameters = {
        body: {
          text: content as string,
          categories,
          outputType: "FourSeverityLevels",
        },
        headers: { "Content-Type": "application/json" },
      }

      const textResponse = await client.path("/text:analyze").post(analyzeTextParameters)

      if (isUnexpected(textResponse)) {
        throw new Error(`Unexpected response: ${JSON.stringify(textResponse.body)}`)
      }

      return {
        categories: textResponse.body.categoriesAnalysis.map(cat => ({
          category: ContentSafetyCategory[cat.category as keyof typeof ContentSafetyCategory],
          severity: cat.severity,
        })),
        category: ContentSafetyCategory.Hate,
      }
    }
    if (contentType === "image") {
      const analyzeImageParameters: AnalyzeImageParameters = {
        body: {
          image: content as { content: string; blobUrl?: string },
          categories,
          outputType: "FourSeverityLevels",
        },
        headers: { "Content-Type": "application/json" },
      }

      const imageResponse = await client.path("/image:analyze").post(analyzeImageParameters)

      if (isUnexpected(imageResponse)) {
        throw new Error(`Unexpected response: ${JSON.stringify(imageResponse.body)}`)
      }

      return {
        categories: imageResponse.body.categoriesAnalysis.map(cat => ({
          category: ContentSafetyCategory[cat.category as keyof typeof ContentSafetyCategory],
          severity: cat.severity,
        })),
        category: ContentSafetyCategory.Hate,
      }
    }
  } catch (error) {
    logger.error("Error analyzing content:" + error)
    return null
  }

  return null
}

export async function performContentAnalysis(textContent: string): Promise<QGovTextCategoriesAnalysisOutput | null> {
  const endpoint = "https://api-dev.ai.qld.gov.au/safeai/v2.0"
  const credential = new AzureKeyCredential(process.env.APIM_KEY)
  const categories = ["Hate", "SelfHarm", "Sexual", "Violence"]

  try {
    const result = await analyzeContentSafety(endpoint, credential, textContent, categories, "text")
    if (!result) {
      return null
    }

    if (result.categories) {
      return result as QGovTextCategoriesAnalysisOutput | null
    }
    logger.warning("Content analysis returned no result or categories.")
    return null
  } catch (error) {
    logger.error("An error occurred during content analysis:" + error)
    return null
  }
}
