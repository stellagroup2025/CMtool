import type React from "react"
import { getBrandAction } from "./actions"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { brandId: string }
}) {
  try {
    const brand = await getBrandAction(params.brandId)

    return (
      <DashboardLayoutClient brand={brand}>
        {children}
      </DashboardLayoutClient>
    )
  } catch (error) {
    console.error("Failed to load brand:", error)
    redirect("/brands")
  }
}
