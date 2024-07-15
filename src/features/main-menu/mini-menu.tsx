"use client"

import { UrlObject } from "url"

import { X, LogIn, LogOut, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import React, { useCallback, useState } from "react"

import { signInProvider } from "@/app-global"

import Typography from "@/components/typography"
import { cn } from "@/lib/utils"

import { menuItems } from "@/app/menus"

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession({ required: false })
  const { theme, setTheme } = useTheme()

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), [])
  const toggleThemeAndClose = useCallback(() => {
    setIsMenuOpen(prev => !prev)
    setTheme(prev => (prev === "light" ? "dark" : "light"))
  }, [setTheme])
  const signout = useCallback(async () => {
    await signOut({ callbackUrl: "/" })
    setIsMenuOpen(false)
  }, [])
  const signin = useCallback(async () => {
    await signIn(signInProvider)
    setIsMenuOpen(false)
  }, [])

  const filteredMenuItems = session
    ? menuItems.filter(item => item.condition !== "unauthenticated")
    : menuItems.filter(item => item.condition !== "authenticated")

  return (
    <>
      {isMenuOpen ? (
        <div
          onClick={toggleMenu}
          className="h-full cursor-pointer flex-col items-center justify-center border-accent text-darkAltButton hover:bg-background hover:underline"
          aria-expanded="true"
          aria-label="Close menu"
          role="button"
          tabIndex={0}
        >
          <X className="items-center hover:bg-link" aria-hidden="true" />
          Menu
        </div>
      ) : (
        <div
          onClick={toggleMenu}
          className="h-full cursor-pointer flex-col items-center justify-center border-accent text-darkAltButton hover:bg-background hover:underline"
          aria-expanded="false"
          aria-label="Open menu"
          role="button"
          tabIndex={0}
        >
          <div
            className="hover:text-darkAltButtonHover rounded-md pl-2 text-darkAltButton hover:bg-buttonHover"
            aria-hidden="true"
          />
          Menu
        </div>
      )}
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
            {filteredMenuItems.map(item => (
              <MiniMenuItem key={item.name} closeMenu={toggleMenu} {...item} />
            ))}
            <div
              onClick={toggleThemeAndClose}
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
                onClick={signout}
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
                onClick={signin}
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
