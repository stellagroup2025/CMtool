"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyToConversationAction, getCannedResponsesAction } from "../actions";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageComposerProps {
  conversationId: string;
  onSent: () => void;
}

export function MessageComposer({ conversationId, onSent }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [cannedResponses, setCannedResponses] = useState<any[]>([]);

  async function handleSend() {
    if (!content.trim()) return;

    setSending(true);
    try {
      const result = await replyToConversationAction(conversationId, content);
      if (result.success) {
        setContent("");
        onSent();
        toast.success("Mensaje enviado");
      } else {
        toast.error(result.error || "Error al enviar mensaje");
      }
    } catch (error) {
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  }

  async function loadCannedResponses() {
    const result = await getCannedResponsesAction();
    if (result.success && result.responses) {
      setCannedResponses(result.responses);
    }
  }

  function handleCannedResponseSelect(response: any) {
    setContent(response.content);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Textarea
          placeholder="Escribe tu respuesta..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[80px]"
        />
      </div>

      <div className="flex items-center justify-between">
        <Popover onOpenChange={(open) => open && loadCannedResponses()}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Respuestas rápidas
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Respuestas predefinidas</h4>
              <div className="space-y-2">
                {cannedResponses.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => handleCannedResponseSelect(response)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <p className="text-sm font-medium">{response.title}</p>
                    <p className="text-xs text-muted-foreground">{response.category}</p>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSend} disabled={!content.trim() || sending}>
          <Send className="h-4 w-4 mr-2" />
          {sending ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
