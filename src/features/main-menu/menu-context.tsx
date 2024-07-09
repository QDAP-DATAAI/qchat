"use client"

import React, { createContext, useContext, useState, useMemo } from "react"

interface MenuContextProps {
  isMenuOpen: boolean
  toggleMenu: () => void
}

export const MenuContext = createContext<MenuContextProps>({
  isMenuOpen: false,
  toggleMenu: () => {},
})

export const MenuProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = (): void => {
    setIsMenuOpen(prevIsMenuOpen => !prevIsMenuOpen)
  }

  const value = useMemo(
    () => ({
      isMenuOpen,
      toggleMenu,
    }),
    [isMenuOpen]
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export const useMenuContext = (): MenuContextProps => useContext(MenuContext)
