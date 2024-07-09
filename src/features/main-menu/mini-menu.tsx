"use client"

import { X, LogOut, LogIn, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import React, { useCallback, useMemo } from "react"

import { MenuItem, menuItems } from "@/app/menus"

import Typography from "@/components/typography"
import { cn } from "@/lib/utils"

import { useMenuContext } from "./menu-context"

const MiniMenuItem: React.FC<MenuItem & { _closeMenu: () => void }> = ({
  href,
  icon: Icon,
  name,
  ariaLabel,
  _closeMenu,
}) => {
  const menuItemClass = cn(
    "cursor-pointer px-6 py-2 hover:bg-accent hover:text-accent-foreground flex items-center whitespace-nowrap"
  )

  const handleClick = useCallback(() => {
    _closeMenu()
  }, [_closeMenu])

  return (
    <Link href={href} passHref>
      <div className={menuItemClass} role="button" tabIndex={0} aria-label={ariaLabel} onClick={handleClick}>
        <Icon className="mr-2 size-4" aria-hidden="true" />
        {name}
      </div>
    </Link>
  )
}

export const MiniMenu: React.FC = () => {
  const { isMenuOpen, toggleMenu } = useMenuContext()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light")
  }, [theme, setTheme])
  const handleMenuClose = useCallback(() => {
    if (isMenuOpen) {
      toggleMenu()
    }
  }, [isMenuOpen, toggleMenu])

  const authenticatedItems = useMemo(() => {
    return menuItems.filter(item => item.condition !== "authenticated" || session)
  }, [session])

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/" })
    handleMenuClose()
  }, [handleMenuClose])

  const handleSignIn = useCallback(async () => {
    await signIn()
    handleMenuClose()
  }, [handleMenuClose])

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
            {authenticatedItems.map(item => (
              <MiniMenuItem key={item.name} _closeMenu={handleMenuClose} {...item} />
            ))}
            <div
              onClick={toggleTheme}
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
                onClick={handleSignOut}
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
                onClick={handleSignIn}
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
