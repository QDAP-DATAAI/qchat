import { SearchField, SearchIndex } from "@azure/search-documents"

export type IndexStatus = "draft" | "experimental" | "active" | "inactive"

export interface IndexModel extends SearchIndex {
  id: string
  name: string
  description: string
  longDescription: string
  systemInstruction: string
  dataOwner: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  fields: SearchField[]
}

export type IndexEntity = {
  id: string
  name: string
  description: string
  longDescription: string
  dataOwner: string
  status: IndexStatus
  createdAt: string
  updatedAt: string
}

export type ApplicationEntity = {
  applicationId: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
  features: ApplicationFeature[]
}

export type ApplicationFeature = {
  featureId: string
  name: string
  description: string
  isPublic: boolean
}

export type TenantApplicationEntity = {
  id: string
  tenantId: string
  applicationId: string
  administratorGroups: string[]
  features: Array<
    ApplicationFeature & {
      enabled: boolean
      accessGroups: string[]
    }
  >
  // Uncomment and define these types as needed
  // history?: string[];
  // config: TenantApplicationConfig;
  // preferences: TenantApplicationPreferences;
  // smartTools: ApplicationSmartToolConfig[];
}
