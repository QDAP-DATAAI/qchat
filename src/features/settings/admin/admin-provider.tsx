"use client"

import { PropsWithChildren, createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"

import { showError } from "@/features/globals/global-message-store"
import { TenantDetails } from "@/features/tenant-management/models"
import { UserRecord } from "@/features/user-management/models"
type AdminContextDefinition = {
  tenants: TenantDetails[]
  users: UserRecord[]
  selectedTenant: TenantDetails | undefined
  selectTenant: (tenant?: TenantDetails) => void
  selectedUser: UserRecord | undefined
  selectUser: (user?: UserRecord) => void
}

const AdminContext = createContext<AdminContextDefinition | undefined>(undefined)

export const useAdminContext = (): AdminContextDefinition => {
  const context = useContext(AdminContext)
  if (!context) throw new Error("AdminContext hasn't been provided!")
  return context
}
export default function AdminProvider({
  children,
  tenants,
  fetchUserRecords,
}: PropsWithChildren<{
  tenants: TenantDetails[]
  fetchUserRecords: (tenantId: string) => Promise<UserRecord[]>
}>): JSX.Element | null {
  const [selectedTenant, setSelectedTenant] = useState<TenantDetails>()
  const [selectedUser, setSelectedUser] = useState<UserRecord>()
  const [users, setUsers] = useState<UserRecord[]>([])
  useEffect(() => {
    if (!selectedTenant?.id) return
    fetchUserRecords(selectedTenant.id).then(setUsers).catch(showError)
  }, [fetchUserRecords, selectedTenant])

  const selectTenant = useCallback((tenant?: TenantDetails) => {
    setSelectedTenant(tenant)
    setSelectedUser(undefined) // Reset selected user when tenant changes
  }, [])

  const selectUser = useCallback((user?: UserRecord) => {
    setSelectedUser(user)
  }, [])

  const value = useMemo(
    () => ({
      tenants,
      users,
      selectedTenant,
      selectTenant,
      selectedUser,
      selectUser,
    }),
    [tenants, users, selectedTenant, selectTenant, selectedUser, selectUser]
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
