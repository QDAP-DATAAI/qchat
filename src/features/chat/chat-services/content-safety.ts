import { TextCategoriesAnalysisOutput as OriginalTextCategoriesAnalysisOutput } from "@azure-rest/ai-content-safety"
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

export enum ContentSafetyCategory {
  Hate = "Hate",
  SelfHarm = "SelfHarm",
  SexualContent = "SexualContent",
  Violence = "Violence",
  Ethical = "Ethical",
  Impartial = "Impartial",
  Fairness = "Fairness",
  Transparency = "Transparency",
  Empathy = "Empathy",
  Accountability = "Accountability",
  LocalRelevance = "LocalRelevance",
}
export interface QGovTextCategoriesAnalysisOutput extends OriginalTextCategoriesAnalysisOutput {
  categories: Array<{
    category: ContentSafetyCategory
    severity?: number
  }>
}

export class QGovCustomTextAnalysis implements QGovTextCategoriesAnalysisOutput {
  categories: Array<{
    category: ContentSafetyCategory
    severity?: number
  }>

  constructor(categories: Array<{ category: ContentSafetyCategory; severity?: number }>) {
    this.categories = categories
    this.category = ContentSafetyCategory.Hate
  }

  generateMessage(): string {
    return this.categories.map(cat => `This message may ${categorySeverityMessageMap[cat.category]};`).join(" ")
  }

  category: ContentSafetyCategory
}

const _customAnalysis = new QGovCustomTextAnalysis([
  { category: ContentSafetyCategory.Hate, severity: 3 },
  { category: ContentSafetyCategory.SexualContent, severity: 2 },
])

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
