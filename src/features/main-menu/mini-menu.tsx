"use client"

import { UrlObject } from "url"

import { CloudUpload, SpellCheck2, X, LogIn, LogOut, Moon, Sun, Home, Bookmark, UserCog } from "lucide-react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import React from "react"

import { signInProvider } from "@/app-global"

import Typography from "@/components/typography"
import { cn } from "@/lib/utils"

import { useMiniMenuContext } from "./mini-menu-context"

interface MiniMenuItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: UrlObject | string
  icon: React.ElementType
  name: string
  ariaLabel: string
  closeMenu: () => void
}

const MiniMenuItem: React.FC<MiniMenuItemProps> = ({ href, icon: Icon, name, ariaLabel, closeMenu, ...props }) => {
  const menuItemClass = cn(
    "cursor-pointer px-6 py-2 hover:bg-accent hover:text-accent-foreground flex items-center whitespace-nowrap",
    props.className
  )

  return (
    <Link href={href} passHref={true} onClick={closeMenu}>
      <div className={menuItemClass} role="button" tabIndex={0} aria-label={ariaLabel}>
        <Icon className="mr-2 size-4" aria-hidden="true" />
        {name}
        <span className="hidden"></span>
      </div>
    </Link>
  )
}

export const MiniMenu: React.FC = () => {
  const { isMenuOpen, toggleMenu } = useMiniMenuContext()
  const { data: session } = useSession({ required: false })
  const { theme, setTheme } = useTheme()

  const toggleTheme = (): void => setTheme(theme === "light" ? "dark" : "light")

  const menuItems = [
    { name: "Home", href: "/chat", icon: Home, ariaLabel: "Navigate to home page" },
    { name: "Settings", href: "/settings/details", icon: UserCog, ariaLabel: "Navigate to settings" },
    { name: "Prompt Guide", href: "/prompt-guide", icon: Bookmark, ariaLabel: "Navigate to prompt guide" },
    { name: "What's New", href: "/whats-new", icon: CloudUpload, ariaLabel: "Navigate to what's new page" },
    {
      name: "Factual Errors",
      href: "/hallucinations",
      icon: SpellCheck2,
      ariaLabel: "Help with factual errors",
    },
  ]

  const handleMenuClose = (): void => {
    if (isMenuOpen) {
      toggleMenu()
    }
  }

  return (
    <>
      <div
        onClick={toggleMenu}
        className="h-full cursor-pointer flex-col items-center justify-center border-accent text-darkAltButton hover:bg-background hover:underline"
        aria-expanded="false"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        role="button"
        tabIndex={0}
      >
        {isMenuOpen ? (
          <X className="items-center hover:bg-link" aria-hidden="true" />
        ) : (
          <div
            className="hover:text-darkAltButtonHover rounded-md pl-2 text-darkAltButton hover:bg-buttonHover"
            aria-hidden="true"
          />
        )}
        Menu
      </div>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[99999] bg-altBackground text-link" role="dialog" aria-modal="true">
          <div className="absolute right-0 top-0 m-4 h-2/6">
            <div
              onClick={toggleMenu}
              className="size-[32px] cursor-pointer p-1 hover:bg-accent hover:text-accent-foreground"
              aria-label="Close menu"
              role="button"
              tabIndex={0}
            >
              <X />
            </div>
          </div>
          <Typography variant="h2" id="menu-heading" className="sr-only">
            Menu
          </Typography>
          <div className="mt-16 p-2">
            {menuItems.map(item => (
              <MiniMenuItem key={item.name} closeMenu={handleMenuClose} {...item} />
            ))}
            <div
              onClick={() => {
                toggleTheme()
                handleMenuClose()
              }}
              className="flex cursor-pointer items-center whitespace-nowrap px-6 py-2 text-link hover:bg-accent hover:text-accent-foreground"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              role="button"
              tabIndex={0}
            >
              {theme === "dark" ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </div>
            {session ? (
              <div
                onClick={async () => {
                  await signOut({ callbackUrl: "/" })
                  handleMenuClose()
                }}
                className="flex cursor-pointer items-center whitespace-nowrap px-6 py-2 hover:bg-accent hover:text-accent-foreground"
                aria-label="Logout"
                role="button"
                tabIndex={0}
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </div>
            ) : (
              <div
                onClick={async () => {
                  await signIn(signInProvider)
                  handleMenuClose()
                }}
                className="flex cursor-pointer items-center whitespace-nowrap px-6 py-2 hover:bg-accent hover:text-accent-foreground"
                aria-label="Login"
                role="button"
                tabIndex={0}
              >
                <LogIn className="mr-2 size-4" />
                Login
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
