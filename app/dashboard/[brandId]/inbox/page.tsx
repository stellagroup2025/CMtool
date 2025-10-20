"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, MessageCircle, AtSign, Send, Paperclip, Smile, Clock } from "lucide-react"
import { mockBrands, mockConversations } from "@/lib/mock-data"
import type { Conversation } from "@/lib/mock-data"

export default function InboxPage() {
  const params = useParams()
  const brandId = params.brandId as string
  const brand = mockBrands.find((b) => b.id === brandId)

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageText, setMessageText] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  if (!brand) {
    return <div>Brand not found</div>
  }

  const conversations = mockConversations.filter((c) => brand.accounts.some((a) => a.id === c.accountId))

  const filteredConversations = conversations.filter((conv) => {
    if (filterStatus !== "all" && conv.status !== filterStatus) return false
    if (filterPriority !== "all" && conv.priority !== filterPriority) return false
    return true
  })

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return
    // Mock sending message
    setMessageText("")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "dm":
        return <MessageSquare className="h-4 w-4" />
      case "comment":
        return <MessageCircle className="h-4 w-4" />
      case "mention":
        return <AtSign className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-accent"
      case "negative":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-secondary/10 text-secondary border-secondary/20"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Unified Inbox</h1>
          <p className="text-muted-foreground mt-1">Manage all conversations in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <Card className="border-border/50 lg:col-span-1 overflow-hidden flex flex-col">
          <div className="border-b border-border p-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="dm" className="text-xs">
                  DMs
                </TabsTrigger>
                <TabsTrigger value="comment" className="text-xs">
                  Comments
                </TabsTrigger>
                <TabsTrigger value="mention" className="text-xs">
                  Mentions
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-border">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conversation.id ? "bg-muted/50 border-l-2 border-primary" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.from.avatar || "/placeholder.svg"} alt={conversation.from.name} />
                      <AvatarFallback>{conversation.from.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{conversation.from.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{conversation.from.username}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(conversation.type)}
                          <Badge variant="secondary" className="text-xs">
                            {conversation.network}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{conversation.preview}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                          {conversation.priority}
                        </Badge>
                        {conversation.status === "new" && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            New
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {conversation.sla}h SLA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Conversation Detail */}
        <Card className="border-border/50 lg:col-span-2 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedConversation.from.avatar || "/placeholder.svg"}
                        alt={selectedConversation.from.name}
                      />
                      <AvatarFallback>{selectedConversation.from.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{selectedConversation.from.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedConversation.from.username}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary">{selectedConversation.network}</Badge>
                        <Badge variant="outline" className={getPriorityColor(selectedConversation.priority)}>
                          {selectedConversation.priority} priority
                        </Badge>
                        <span className={`text-xs ${getSentimentColor(selectedConversation.sentiment)}`}>
                          {selectedConversation.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue={selectedConversation.status}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedConversation.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {selectedConversation.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.from === "brand" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.from === "brand" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.from === "brand" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} className="h-10 w-10" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="space-y-3">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <p className="font-medium">No conversation selected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a conversation from the list to view and respond
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
