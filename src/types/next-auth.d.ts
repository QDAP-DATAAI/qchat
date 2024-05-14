import { DefaultSession } from "next-auth"

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    user: {
      qchatAdmin: boolean
      tenantAdmin: boolean
      tenantId: string
      upn: string
      userId: string
    } & DefaultSession["user"]
  }
  interface Token {
    qchatAdmin: boolean
  }
  interface User {
    qchatAdmin: boolean
    tenantAdmin: boolean
    tenantId: string
    upn: string
    userId: string
    secGroups: string[]
  }
}
