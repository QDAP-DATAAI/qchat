import { UserRoundCog, FileClock, CircleHelp, Building2, ShieldCheck } from "lucide-react"

import { isTenantAdmin, isAdmin } from "@/features/auth/helpers"
import { SettingsMenuItem } from "@/features/settings/settings-menu-item"

const menuItems = [
  { url: "/settings/details", icon: <UserRoundCog size={16} />, text: "Your details" },
  { url: "/settings/history", icon: <FileClock size={16} />, text: "Chat history" },
  { url: "/settings/help", icon: <CircleHelp size={16} />, text: "Help & Support" },
  { url: "/settings/tenant", icon: <Building2 size={16} />, text: "Department details", tenantAdminRequired: true },
  { url: "/settings/admin", icon: <ShieldCheck size={16} />, text: "Admin", adminRequired: true },
]

export const SettingsMenuItems = async (): Promise<JSX.Element> => {
  const tenantAdmin = await isTenantAdmin()
  const admin = await isAdmin()

  const adminFilters = (item: { tenantAdminRequired?: boolean; adminRequired?: boolean }): boolean => {
    if (!item.tenantAdminRequired && !item.adminRequired) return true
    if (item.tenantAdminRequired && tenantAdmin) return true
    if (item.adminRequired && admin) return true
    return false
  }

  return (
    <div className="flex flex-col gap-4">
      {menuItems.filter(adminFilters).map(item => (
        <SettingsMenuItem key={item.url} url={item.url} icon={item.icon} text={item.text} />
      ))}
    </div>
  )
}
