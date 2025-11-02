"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveOAuthCredentialsAction, deleteOAuthCredentialsAction } from "@/app/dashboard/[brandId]/settings/actions"
import { Platform } from "@prisma/client"
import { Loader2, Eye, EyeOff, Trash2, Key } from "lucide-react"

interface OAuthCredentialsFormProps {
  brandId: string
  platform: Platform
  platformName: string
  platformColor: string
  existingCredentials?: {
    clientId: string
    clientSecret: string
  } | null
}

export function OAuthCredentialsForm({
  brandId,
  platform,
  platformName,
  platformColor,
  existingCredentials,
}: OAuthCredentialsFormProps) {
  const [clientId, setClientId] = useState(existingCredentials?.clientId || "")
  const [clientSecret, setClientSecret] = useState(existingCredentials?.clientSecret || "")
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await saveOAuthCredentialsAction(brandId, platform, clientId, clientSecret)
      setSuccess("Credentials saved successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credentials")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete these credentials? You won't be able to connect new accounts until you add them again.")) {
      return
    }

    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      await deleteOAuthCredentialsAction(brandId, platform)
      setClientId("")
      setClientSecret("")
      setSuccess("Credentials deleted successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete credentials")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${platformColor}`}>
              <Key className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{platformName} API Credentials</CardTitle>
              <CardDescription>
                Configure your {platformName} App credentials to enable OAuth connections
              </CardDescription>
            </div>
          </div>
          {existingCredentials && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">App ID / Client ID</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="Enter your App ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your {platformName} App ID from the developer console
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">App Secret / Client Secret</Label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showSecret ? "text" : "password"}
                placeholder="Enter your App Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your {platformName} App Secret from the developer console (stored encrypted)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Credentials"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
