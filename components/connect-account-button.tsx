"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { disconnectAccountAction } from "@/app/dashboard/[brandId]/settings/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ConnectAccountButtonProps {
  brandId: string
  platform: string
  isConnected: boolean
  accountId?: string
  hasCredentials?: boolean
}

export function ConnectAccountButton({
  brandId,
  platform,
  isConnected,
  accountId,
  hasCredentials = true,
}: ConnectAccountButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = () => {
    // Check if credentials are configured
    if (!hasCredentials) {
      toast.error("API credentials not configured", {
        description: "Please configure your API credentials in the settings above before connecting an account."
      })
      return
    }

    // Start OAuth flow
    const state = JSON.stringify({ brandId, platform })

    if (platform === "INSTAGRAM") {
      window.location.href = `/api/oauth/authorize/instagram?state=${encodeURIComponent(state)}`
    } else {
      toast.info(`${platform} OAuth is not implemented yet`, {
        description: "This feature is coming soon"
      })
    }
  }

  const handleDisconnect = async () => {
    if (!accountId) return

    setIsLoading(true)
    try {
      await disconnectAccountAction(accountId)
      toast.success("Account disconnected successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to disconnect account")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? "Disconnecting..." : "Disconnect"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this social account from your brand. You can reconnect it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Button onClick={handleConnect} size="sm">
      Connect
    </Button>
  )
}
