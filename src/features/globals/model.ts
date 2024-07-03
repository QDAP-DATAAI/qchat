export type ApplicationSettings = {
  applicationId: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
  administratorAccess: AdministratorTenantGroups[]
  transcriptionAccess: AdministratorTenantGroups[]
}

export type AdministratorTenantGroups = {
  tenant: string
  groups: string[]
}
