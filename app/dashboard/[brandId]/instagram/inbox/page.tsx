"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Inbox as InboxIcon,
  Send,
  Search,
  RefreshCw,
  MessageSquare,
  BarChart3,
  Image as ImageIcon,
  Calendar,
  InfoIcon,
  Archive,
  CheckCircle,
  Bug,
} from "lucide-react"
import { getSavedConversations, sendMessage, updateConversationStatus, syncConversationsFromInstagram, debugInstagramPermissions, diagnoseMetaAppConfiguration } from "./actions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function InboxPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messageText, setMessageText] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const loadConversations = async () => {
    setLoading(true)

    const filters: any = {}
    if (filterStatus !== "all") {
      filters.status = filterStatus.toUpperCase()
    }

    const result = await getSavedConversations(brandId, filters)
    if (result.success) {
      setConversations(result.conversations || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadConversations()
  }, [brandId, filterStatus])

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageText.trim()) return

    setSendingMessage(true)

    const result = await sendMessage(
      brandId,
      selectedConversation.fromUserId,
      messageText
    )

    if (result.success) {
      toast.success("Message sent successfully")
      setMessageText("")
      // Refresh conversation messages
      loadConversations()
      // Scroll to bottom after sending
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      }, 100)
    } else {
      toast.error(result.error || "Failed to send message")
    }

    setSendingMessage(false)
  }

  const handleStatusChange = async (conversationId: string, status: any) => {
    const result = await updateConversationStatus(conversationId, status)
    if (result.success) {
      toast.success("Status updated successfully")
      loadConversations()
    } else {
      toast.error(result.error || "Failed to update status")
    }
  }

  const handleSyncFromInstagram = async () => {
    setSyncing(true)
    const result = await syncConversationsFromInstagram(brandId)

    if (result.success) {
      if (result.synced === 0 && result.total === 0) {
        toast.info(result.message || "No conversations found in Instagram inbox")
      } else {
        toast.success(`Synced ${result.synced} of ${result.total} conversations`)
      }
      loadConversations()
    } else {
      toast.error(result.error || "Failed to sync conversations", {
        duration: 5000,
      })
    }
    setSyncing(false)
  }

  const handleDebug = async () => {
    const result = await debugInstagramPermissions(brandId)

    if (result.success && result.debug) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("📊 INSTAGRAM API DEBUG INFO")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

      console.log("\n🔑 Token Information:")
      console.log("  • Token Type:", result.debug.tokenInfo.type.toUpperCase())
      console.log("  • Is Valid:", result.debug.tokenInfo.isValid ? "✅ Yes" : "❌ No")
      console.log("  • App ID:", result.debug.tokenInfo.appId)
      console.log("  • Expires:", result.debug.tokenInfo.expiresAt || "Never (long-lived)")

      console.log("\n📱 Instagram Account:")
      console.log("  • Account ID:", result.debug.accountId)
      console.log("  • Username:", result.debug.igDetails.username)
      console.log("  • Name:", result.debug.igDetails.name)

      console.log("\n✅ Granted Scopes:")
      result.debug.scopeCheck.grantedScopes.forEach((scope: string) => {
        console.log(`  ✓ ${scope}`)
      })

      if (result.debug.scopeCheck.missingScopes.length > 0) {
        console.log("\n❌ Missing Scopes (required for messaging):")
        result.debug.scopeCheck.missingScopes.forEach((scope: string) => {
          console.log(`  ✗ ${scope}`)
        })
      }

      console.log("\n📩 Conversations Endpoint:")
      console.log("  • Status:", result.debug.conversationsEndpoint.success ? "✅ Working" : "❌ Failed")
      console.log("  • Conversations Found:", result.debug.conversationsEndpoint.count)
      if (result.debug.conversationsEndpoint.error) {
        console.log("  • Error:", result.debug.conversationsEndpoint.error)
      }

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

      // Verificar si todo está correcto
      if (result.debug.tokenInfo.type !== "page") {
        toast.error("⚠️ Token type should be PAGE, not USER. Please reconnect your account.")
      } else if (!result.debug.scopeCheck.hasAllScopes) {
        toast.error(`Missing ${result.debug.scopeCheck.missingScopes.length} required scope(s). Check console for details.`)
      } else if (!result.debug.conversationsEndpoint.success) {
        toast.error("Conversations endpoint failed: " + result.debug.conversationsEndpoint.error)
      } else {
        toast.success(`✅ Everything looks good! Found ${result.debug.conversationsEndpoint.count} conversations. Check console for full details.`)
      }
    } else {
      console.error("Debug error:", result.error)
      toast.error(result.error || "Debug failed")
    }
  }

  const handleDiagnose = async () => {
    toast.info("Running diagnostic tests...", { duration: 2000 })

    const result = await diagnoseMetaAppConfiguration(brandId)

    if (result.success && result.diagnosis) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("🔬 META APP CONFIGURATION DIAGNOSIS")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

      if (result.diagnosis.appInfo) {
        console.log("\n📱 App Information:")
        console.log("  • App ID:", result.diagnosis.appInfo.id)
        console.log("  • App Name:", result.diagnosis.appInfo.name)
        console.log("  • App Link:", result.diagnosis.appInfo.link)
      }

      console.log("\n🧪 Endpoint Tests:")
      result.diagnosis.tests.forEach((test: any) => {
        console.log(`\n  ${test.passed ? "✅" : "❌"} ${test.name}`)
        if (test.endpoint) {
          console.log(`     Endpoint: ${test.endpoint}`)
        }
        if (test.accountType) {
          const typeEmoji = test.accountType === "business" ? "✅" : "❌"
          console.log(`     Account Type: ${typeEmoji} ${test.accountType.toUpperCase()}`)
          console.log(`     Insights Access: ${test.hasInsightsAccess ? "✅ Yes" : "❌ No"}`)
        }
        if (test.error) {
          console.log(`     Error: ${test.error}`)
          if (test.errorCode) {
            console.log(`     Error Code: ${test.errorCode}`)
          }
        }
      })

      console.log("\n💡 Recommendations:")
      result.diagnosis.recommendations.forEach((rec: any, index: number) => {
        const severityEmoji = {
          critical: "🚨",
          high: "⚠️",
          medium: "ℹ️",
          info: "✅"
        }[rec.severity] || "•"

        console.log(`\n  ${severityEmoji} ${rec.title}`)
        console.log(`     ${rec.message}`)

        if (rec.actions && rec.actions.length > 0) {
          console.log(`     Steps to fix:`)
          rec.actions.forEach((action: string, i: number) => {
            console.log(`       ${i + 1}. ${action}`)
          })
        }
      })

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

      // Show the main issue in a toast
      const criticalRec = result.diagnosis.recommendations.find((r: any) => r.severity === "critical")
      if (criticalRec) {
        toast.error(criticalRec.title + ": " + criticalRec.message, {
          duration: 10000,
          description: "Check console for detailed steps to fix"
        })
      } else {
        const allPassed = result.diagnosis.tests.every((t: any) => t.passed)
        if (allPassed) {
          toast.success("All diagnostic tests passed! ✅")
        } else {
          toast.warning("Some tests failed. Check console for recommendations.")
        }
      }
    } else {
      console.error("Diagnosis error:", result.error)
      toast.error(result.error || "Diagnosis failed")
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.fromUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.fromDisplayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground mt-1">
            Manage Instagram direct messages
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDiagnose} variant="secondary" size="sm" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/30">
            <Bug className="mr-2 h-4 w-4" />
            Diagnose
          </Button>
          <Button onClick={handleDebug} variant="secondary" size="sm">
            <Bug className="mr-2 h-4 w-4" />
            Debug
          </Button>
          <Button onClick={handleSyncFromInstagram} variant="default" size="sm" disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? "Syncing..." : "Sync from Instagram"}
          </Button>
          <Button onClick={loadConversations} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram`)}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Feed
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/comments`)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Comments
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/analytics`)}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/publish`)}
        >
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/schedule`)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <InboxIcon className="mr-2 h-4 w-4" />
          Inbox
        </Button>
      </div>

      {/* Permission Info */}
      <Alert className="border-blue-500/50 bg-blue-500/5">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Instagram Messaging Requirements</AlertTitle>
        <AlertDescription className="space-y-2 text-xs">
          <p>
            Instagram messaging requires a <strong>Page Access Token</strong> (not a User token).
            The OAuth flow automatically obtains this token.
          </p>
          <p>
            <strong>Required permissions:</strong>
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><code>instagram_manage_messages</code> - Send and receive messages</li>
            <li><code>pages_show_list</code> - Access Facebook pages</li>
            <li><code>instagram_basic</code> - Basic Instagram access</li>
          </ul>
          <p className="mt-2">
            Click <strong>Debug</strong> to verify your token type and permissions.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Conversations</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {["all", "new", "in_progress", "resolved"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="text-xs"
                >
                  {status === "all" ? "All" : status.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <InboxIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.fromAvatar} />
                        <AvatarFallback>
                          {conv.fromUsername?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm truncate">
                            {conv.fromDisplayName || conv.fromUsername}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {conv.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          @{conv.fromUsername}
                        </p>
                        {conv.messages[0] && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {conv.messages[0].content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            {selectedConversation ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.fromAvatar} />
                    <AvatarFallback>
                      {selectedConversation.fromUsername?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {selectedConversation.fromDisplayName || selectedConversation.fromUsername}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      @{selectedConversation.fromUsername}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(
                        selectedConversation.id,
                        selectedConversation.status === "RESOLVED" ? "IN_PROGRESS" : "RESOLVED"
                      )
                    }
                  >
                    {selectedConversation.status === "RESOLVED" ? (
                      <>
                        <InboxIcon className="h-4 w-4 mr-2" />
                        Reopen
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedConversation.id, "CLOSED")}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <CardTitle className="text-base">Select a conversation</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {!selectedConversation ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a conversation to view messages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages */}
                <div className="messages-container space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    [...selectedConversation.messages].reverse().map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from === "BRAND" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.from === "BRAND"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.from === "BRAND"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Message */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Note: Message functionality requires <code>instagram_manage_messages</code>{" "}
                    permission. This is a preview of the inbox interface.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
