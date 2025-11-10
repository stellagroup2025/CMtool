"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageSquare, Hash, AtSign, Star } from "lucide-react";
import { ConversationType, ConversationStatus, ConversationPriority } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type Conversation = any;

interface InboxSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function InboxSidebar({ conversations, selectedId, onSelect, loading }: InboxSidebarProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No hay conversaciones</h3>
        <p className="text-sm text-muted-foreground">
          Las conversaciones aparecerán aquí cuando recibas mensajes
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedId}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const lastMessage = conversation.messages[0];
  const unreadBadge = conversation.status === ConversationStatus.NEW;

  const getTypeIcon = (type: ConversationType) => {
    switch (type) {
      case ConversationType.DM:
        return <MessageSquare className="h-4 w-4" />;
      case ConversationType.COMMENT:
        return <Hash className="h-4 w-4" />;
      case ConversationType.MENTION:
        return <AtSign className="h-4 w-4" />;
      case ConversationType.REVIEW:
        return <Star className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: ConversationPriority) => {
    switch (priority) {
      case ConversationPriority.URGENT:
        return "destructive";
      case ConversationPriority.HIGH:
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.fromAvatar} />
          <AvatarFallback>{conversation.fromUsername[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">
                {conversation.fromDisplayName || conversation.fromUsername}
              </span>
              {getTypeIcon(conversation.type)}
            </div>
            {unreadBadge && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2 truncate">
            @{conversation.fromUsername} · {conversation.socialAccount.platform}
          </p>

          {lastMessage && (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {lastMessage.content}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
            {conversation.priority !== ConversationPriority.MEDIUM && (
              <Badge variant={getPriorityColor(conversation.priority)} className="text-xs">
                {conversation.priority}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
