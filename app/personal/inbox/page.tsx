"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Sparkles,
  Send,
  Filter,
  Search,
  Heart,
  MessageCircle,
  Star
} from "lucide-react"
import { toast } from "sonner"

const FILTERS = [
  { id: "all", label: "Todos", icon: MessageSquare },
  { id: "collaborations", label: "Colaboraciones", icon: Star },
  { id: "questions", label: "Preguntas", icon: MessageCircle },
  { id: "positive", label: "Elogios", icon: Heart },
]

export default function PersonalInboxPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [aiSuggestion, setAiSuggestion] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [filter])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/personal/inbox?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReply = async () => {
    if (!selectedConversation) return

    setLoading(true)
    try {
      const response = await fetch("/api/personal/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          lastMessage: selectedConversation.messages?.[0]?.content,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestion(data.suggestion)
        toast.success("Sugerencia generada")
      }
    } catch (error) {
      toast.error("Error al generar sugerencia")
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/personal/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: replyText,
        }),
      })

      if (response.ok) {
        toast.success("Respuesta enviada")
        setReplyText("")
        setAiSuggestion("")
        fetchConversations()
      }
    } catch (error) {
      toast.error("Error al enviar respuesta")
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Mensajes
          </h1>
          <p className="text-muted-foreground mt-1">
            Conecta con tu audiencia
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="grid w-full grid-cols-4">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.id} value={f.id}>
                    <f.icon className="h-4 w-4 mr-2" />
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Inbox Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Conversaciones</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay mensajes</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedConversation?.id === conv.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    } border`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.fromAvatar} />
                        <AvatarFallback>
                          {conv.fromUsername?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {conv.fromDisplayName || conv.fromUsername}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {conv.platform}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conv.messages?.[0]?.content || "Sin mensajes"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Conversation Detail */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedConversation.fromAvatar} />
                        <AvatarFallback>
                          {selectedConversation.fromUsername?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {selectedConversation.fromDisplayName ||
                            selectedConversation.fromUsername}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {selectedConversation.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Messages */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedConversation.messages?.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.from === "BRAND" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.from === "BRAND"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Suggestion */}
                  {aiSuggestion && (
                    <Card className="bg-accent/10 border-accent/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-accent mt-0.5" />
                          <p className="text-sm font-medium">Sugerencia de IA:</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {aiSuggestion}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyText(aiSuggestion)}
                        >
                          Usar esta respuesta
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reply Box */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Escribe tu respuesta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleGenerateReply}
                        disabled={loading}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generar con IA
                      </Button>
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Selecciona una conversación para comenzar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
