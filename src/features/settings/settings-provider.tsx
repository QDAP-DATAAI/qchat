"use client"

import { PropsWithChildren, createContext, useContext, useMemo } from "react"

import { TenantConfig } from "@/features/tenant-management/models"

type SettingsContextDefinition = {
  config: TenantConfig
}

const SettingsContext = createContext<SettingsContextDefinition | undefined>(undefined)

export const useSettingsContext = (): SettingsContextDefinition => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("SettingsContext hasn't been provided!")
  return context
}

export default function SettingsProvider({
  children,
  config,
}: PropsWithChildren<SettingsContextDefinition>): JSX.Element | null {
  const value = useMemo(() => ({ config }), [config])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
