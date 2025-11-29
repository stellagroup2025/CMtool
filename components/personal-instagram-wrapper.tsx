"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function PersonalInstagramWrapper({
  children,
  brandId
}: {
  children: React.ReactNode
  brandId: string
}) {
  const router = useRouter()

  // Inject brandId into the URL params for child components
  useEffect(() => {
    // Store brandId in sessionStorage for child components to access
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('personalBrandId', brandId)
    }
  }, [brandId])

  return <>{children}</>
}

// Hook to get brandId in child components
export function usePersonalBrandId(): string | null {
  const [brandId, setBrandId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('personalBrandId')
      setBrandId(id)
    }
  }, [])

  return brandId
}
