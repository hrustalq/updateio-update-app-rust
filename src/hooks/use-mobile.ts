import React from "react"

// Define the breakpoint for mobile devices (you can adjust this value)
const MOBILE_BREAKPOINT = "768px"

export function useMobile() {
  // Initialize with null to avoid hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    // Create the media query
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT})`)

    // Set initial value
    setIsMobile(mediaQuery.matches)

    // Create event listener function
    const updateTarget = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Add the listener
    mediaQuery.addEventListener("change", updateTarget)

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", updateTarget)
    }
  }, [])

  // Return false during SSR, then actual value after hydration
  return isMobile ?? false
}

