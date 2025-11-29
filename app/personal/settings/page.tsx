import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Facebook, Twitter, Linkedin, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getSocialAccountsAction, getOAuthCredentialsAction } from "./actions"
import { ConnectAccountButton } from "@/components/connect-account-button"
import { OAuthCredentialsForm } from "@/components/oauth-credentials-form"
import { LogoUpload } from "@/components/logo-upload"
import { Platform } from "@prisma/client"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function PersonalSettingsPage() {
  const session = await requireAuth()

  // Get user's personal brand
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      memberships: {
        where: {
          brand: {
            isPersonal: true,
          },
        },
        include: {
          brand: true,
        },
      },
    },
  })

  if (!user || user.memberships.length === 0) {
    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Personal brand not found</p>
        </div>
      </div>
    )
  }

  const brandId = user.memberships[0].brand.id

  // Get connected accounts
  const accounts = await getSocialAccountsAction(brandId)

  // Get Instagram credentials
  const instagramCredentials = await getOAuthCredentialsAction(brandId, Platform.INSTAGRAM)

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
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal brand and connected social accounts</p>
      </div>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo de Marca
          </CardTitle>
          <CardDescription>
            Sube tu logo para usarlo en las plantillas y contenido generado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoUpload />
        </CardContent>
      </Card>

      {/* API Credentials Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">API Credentials</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your OAuth credentials for each platform. These are required to connect accounts.
          </p>
        </div>
        <OAuthCredentialsForm
          brandId={brandId}
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
                  brandId={brandId}
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
    </div>
  )
}
