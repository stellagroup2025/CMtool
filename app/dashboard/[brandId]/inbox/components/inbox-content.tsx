"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { InboxSidebar } from "./inbox-sidebar";
import { ConversationView } from "./conversation-view";
import { InboxStats } from "./inbox-stats";
import { InboxFilters } from "./inbox-filters";
import { getInboxConversationsAction, getInboxStatsAction, type InboxFilters as InboxFiltersType } from "../actions";
import { ConversationStatus, ConversationType, Platform } from "@prisma/client";

export function InboxContent({ brandId }: { brandId: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<InboxFiltersType>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    loadStats();
  }, [brandId, filters]);

  async function loadConversations() {
    setLoading(true);
    const result = await getInboxConversationsAction(brandId, filters);
    if (result.success && result.conversations) {
      setConversations(result.conversations);
      if (result.conversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(result.conversations[0].id);
      }
    }
    setLoading(false);
  }

  async function loadStats() {
    const result = await getInboxStatsAction(brandId);
    if (result.success && result.stats) {
      setStats(result.stats);
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && <InboxStats stats={stats} />}

      {/* Filters */}
      <InboxFilters filters={filters} onFiltersChange={setFilters} />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-400px)]">
        {/* Sidebar */}
        <Card className="lg:col-span-1 overflow-hidden">
          <InboxSidebar
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            loading={loading}
          />
        </Card>

        {/* Conversation view */}
        <Card className="lg:col-span-2 overflow-hidden">
          {selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              onUpdate={loadConversations}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Selecciona una conversación para ver los mensajes
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
