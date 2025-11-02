import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react"
import { getSocialAccountsAction, getOAuthCredentialsAction } from "./actions"
import { ConnectAccountButton } from "@/components/connect-account-button"
import { OAuthCredentialsForm } from "@/components/oauth-credentials-form"
import { Platform } from "@prisma/client"

export default async function SettingsPage({ params }: { params: { brandId: string } }) {
  const accounts = await getSocialAccountsAction(params.brandId)

  // Get Instagram credentials
  const instagramCredentials = await getOAuthCredentialsAction(params.brandId, Platform.INSTAGRAM)

  const platforms = [
    {
      id: "INSTAGRAM",
      name: "Instagram",
      icon: Instagram,
      description: "Connect your Instagram Business account",
      color: "text-pink-500",
    },
    {
      id: "FACEBOOK",
      name: "Facebook",
      icon: Facebook,
      description: "Connect your Facebook Page",
      color: "text-blue-600",
    },
    {
      id: "X",
      name: "X (Twitter)",
      icon: Twitter,
      description: "Connect your X account",
      color: "text-gray-900 dark:text-white",
    },
    {
      id: "LINKEDIN",
      name: "LinkedIn",
      icon: Linkedin,
      description: "Connect your LinkedIn Page",
      color: "text-blue-700",
    },
    {
      id: "YOUTUBE",
      name: "YouTube",
      icon: Youtube,
      description: "Connect your YouTube Channel",
      color: "text-red-600",
    },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your brand and connected social accounts</p>
      </div>

      {/* API Credentials Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">API Credentials</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your OAuth credentials for each platform. These are required to connect accounts.
          </p>
        </div>
        <OAuthCredentialsForm
          brandId={params.brandId}
          platform={Platform.INSTAGRAM}
          platformName="Instagram"
          platformColor="text-pink-500"
          existingCredentials={instagramCredentials}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Connect your social media accounts to manage them from one place</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const connectedAccount = accounts.find((acc) => acc.platform === platform.id)

            return (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${platform.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{platform.name}</h3>
                      {connectedAccount && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {connectedAccount ? `@${connectedAccount.username}` : platform.description}
                    </p>
                  </div>
                </div>
                <ConnectAccountButton
                  brandId={params.brandId}
                  platform={platform.id}
                  isConnected={!!connectedAccount}
                  accountId={connectedAccount?.id}
                  hasCredentials={platform.id === "INSTAGRAM" ? !!instagramCredentials : true}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>Update your brand details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Brand settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
