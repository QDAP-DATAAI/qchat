export type ApplicationSettings = {
  applicationId: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
  administratorAccess: TenantGroupPairs[]
  transcriptionAccess: TenantGroupPairs[]
  indexes: ApplicationIndexSettings[]
}

export type TenantGroupPairs = {
  tenant: string
  groups: string[]
}

export type ApplicationIndexSettings = {
  id: string
  name: string
  description: string
  isActive: boolean
  isPublic: boolean
  tenantAccess: string[]
}
