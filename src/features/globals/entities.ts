// interface IndexModel extends SearchIndex {
//   id: string
//   name: string
//   description: string
//   longDescription: string
//   systemInstruction: string
//   dataOwner: string
//   isActive: boolean
//   createdAt: Date
//   updatedAt: Date
//   fields: SearchField[]
//   accessSettings: TenantGroupPairs[]
//   searchConfiguration: AzureSearchChatExtensionConfiguration
// }

type IndexEntity = {
  id: string
  name: string
  description: string
  longDescription: string
  dataOwner: string
  status: IndexStatus
  createdAt: string
  updatedAt: string
}
type IndexStatus = "draft" | "experimental" | "active" | "inactive"

type ApplicationEntity = {
  applicationId: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
  features: ApplicationFeature[]
}

type ApplicationFeature = {
  featureId: string
  name: string
  description: string
  isPublic: boolean
}

type TenantApplicationEntity = {
  id: string
  tenantId: string
  applicationId: string
  administratorGroups: string[]
  features: ApplicationFeature &
    {
      enabled: boolean
      accessGroups: string[]
    }[]
  // history?: string[]
  // config: TenantApplicationConfig
  // preferences: TenantApplicationPreferences
  // smartTools: ApplicationSmartToolConfig[]
}
