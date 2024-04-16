import { UserRoundCog, FileClock, CircleHelp, Settings } from "lucide-react"

import { MenuItem } from "@/components/menu"
import { isTenantAdmin } from "@/features/auth/helpers"

const menuItems = [
  { url: "/settings/tenant", icon: <Settings size={16} />, text: "Tenant Details", adminRequired: true },
  { url: "/settings/details", icon: <UserRoundCog size={16} />, text: "Personal Details" },
  { url: "/settings/history", icon: <FileClock size={16} />, text: "Chat History" },
  { url: "/settings/help", icon: <CircleHelp size={16} />, text: "Help & Support" },
]

export const SettingsMenuItems = async (): Promise<JSX.Element> => {
  const isAdmin = await isTenantAdmin()

  return (
    <div className="flex flex-col gap-4">
      {menuItems
        .filter(m => !m.adminRequired || (m.adminRequired && isAdmin))
        .map(item => (
          <MenuItem href={item.url} key={item.url}>
            {item.icon}
            <span>{item.text}</span>
          </MenuItem>
        ))}
    </div>
  )
}
