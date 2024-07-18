import { useRef, useEffect } from "react"

export default function useSyncScroll<T extends HTMLElement>() {
  const leftPanelRef = useRef<T>(null)
  const rightPanelRef = useRef<T>(null)

  useEffect(() => {
    const leftPanel = leftPanelRef.current
    const rightPanel = rightPanelRef.current

    const handleScroll = (sourcePanel: HTMLElement | null, targetPanel: HTMLElement | null) => {
      if (!sourcePanel || !targetPanel) return
      targetPanel.scrollTop = sourcePanel.scrollTop
    }

    const handleLeftScroll = () => handleScroll(leftPanel, rightPanel)
    const handleRightScroll = () => handleScroll(rightPanel, leftPanel)

    if (!leftPanel || !rightPanel) return

    leftPanel.addEventListener("scroll", handleLeftScroll)
    rightPanel.addEventListener("scroll", handleRightScroll)

    return () => {
      if (!leftPanel || !rightPanel) return
      leftPanel.removeEventListener("scroll", handleLeftScroll)
      rightPanel.removeEventListener("scroll", handleRightScroll)
    }
  }, [])

  return [leftPanelRef, rightPanelRef]
}
