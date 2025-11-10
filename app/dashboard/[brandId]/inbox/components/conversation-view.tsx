"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "./message-composer";
import { getConversationDetailAction, updateConversationStatusAction, updateConversationPriorityAction } from "../actions";
import { MessageFrom, ConversationStatus, ConversationPriority } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreVertical, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Conversation = any;

interface ConversationViewProps {
  conversation: Conversation;
  onUpdate: () => void;
}

export function ConversationView({ conversation, onUpdate }: ConversationViewProps) {
  const [detailedConversation, setDetailedConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversationDetail();
  }, [conversation.id]);

  async function loadConversationDetail() {
    setLoading(true);
    const result = await getConversationDetailAction(conversation.id);
    if (result.success && result.conversation) {
      setDetailedConversation(result.conversation);
    }
    setLoading(false);
  }

  async function handleStatusChange(status: ConversationStatus) {
    await updateConversationStatusAction(conversation.id, status);
    await loadConversationDetail();
    onUpdate();
  }

  async function handlePriorityChange(priority: ConversationPriority) {
    await updateConversationPriorityAction(conversation.id, priority);
    await loadConversationDetail();
    onUpdate();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!detailedConversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No se pudo cargar la conversación
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={detailedConversation.fromAvatar} />
            <AvatarFallback>
              {detailedConversation.fromUsername[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {detailedConversation.fromDisplayName || detailedConversation.fromUsername}
            </h3>
            <p className="text-sm text-muted-foreground">
              @{detailedConversation.fromUsername}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={
            detailedConversation.status === ConversationStatus.NEW ? "default" :
            detailedConversation.status === ConversationStatus.IN_PROGRESS ? "secondary" :
            "outline"
          }>
            {detailedConversation.status}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Estado</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange(ConversationStatus.NEW)}>
                <Circle className="mr-2 h-4 w-4" />
                Nuevo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(ConversationStatus.IN_PROGRESS)}>
                <AlertCircle className="mr-2 h-4 w-4" />
                En progreso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(ConversationStatus.RESOLVED)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Resuelto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(ConversationStatus.CLOSED)}>
                Cerrado
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Prioridad</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePriorityChange(ConversationPriority.LOW)}>
                Baja
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(ConversationPriority.MEDIUM)}>
                Media
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(ConversationPriority.HIGH)}>
                Alta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(ConversationPriority.URGENT)}>
                Urgente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {detailedConversation.messages.map((message: any) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t p-4">
        <MessageComposer
          conversationId={detailedConversation.id}
          onSent={() => {
            loadConversationDetail();
            onUpdate();
          }}
        />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: any }) {
  const isFromBrand = message.from === MessageFrom.BRAND;

  return (
    <div className={cn("flex gap-3", isFromBrand && "flex-row-reverse")}>
      <Avatar className="h-8 w-8">
        {isFromBrand && <AvatarFallback>Tú</AvatarFallback>}
        {!isFromBrand && <AvatarFallback>U</AvatarFallback>}
      </Avatar>

      <div className={cn("flex flex-col gap-1", isFromBrand && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2 max-w-[70%]",
            isFromBrand ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(message.createdAt), "PPp", { locale: es })}
        </span>
      </div>
    </div>
  );
}
