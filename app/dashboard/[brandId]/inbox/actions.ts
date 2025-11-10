"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  ConversationStatus,
  ConversationPriority,
  MessageFrom,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type InboxFilters = {
  platform?: string;
  type?: string;
  status?: ConversationStatus;
  priority?: ConversationPriority;
  sentiment?: string;
  search?: string;
  assignedTo?: string;
};

export async function getInboxConversationsAction(
  brandId: string,
  filters?: InboxFilters
) {
  await requireAuth();

  const where: any = { brandId };

  if (filters?.platform) where.platform = filters.platform;
  if (filters?.type) where.type = filters.type;
  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.sentiment) where.sentiment = filters.sentiment;
  if (filters?.search) {
    where.OR = [
      { fromUsername: { contains: filters.search, mode: 'insensitive' } },
      { fromDisplayName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      socialAccount: {
        select: {
          id: true,
          platform: true,
          username: true,
          avatar: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  });

  return { success: true, conversations };
}

export async function getConversationDetailAction(conversationId: string) {
  await requireAuth();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      socialAccount: {
        select: {
          id: true,
          platform: true,
          username: true,
          avatar: true,
          brandId: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    return { success: false, error: "Conversación no encontrada" };
  }

  return { success: true, conversation };
}

export async function replyToConversationAction(
  conversationId: string,
  content: string
) {
  await requireAuth();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      socialAccount: true,
    },
  });

  if (!conversation) {
    return { success: false, error: "Conversación no encontrada" };
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      platform: conversation.platform,
      from: MessageFrom.BRAND,
      externalId: "local_" + Date.now(),
      content,
      mediaUrls: [],
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      status: ConversationStatus.IN_PROGRESS,
    },
  });

  revalidatePath("/dashboard/" + conversation.brandId + "/inbox");

  return { success: true, message };
}

export async function updateConversationStatusAction(
  conversationId: string,
  status: ConversationStatus
) {
  await requireAuth();

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { status },
  });

  revalidatePath("/dashboard/" + conversation.brandId + "/inbox");

  return { success: true, conversation };
}

export async function updateConversationPriorityAction(
  conversationId: string,
  priority: ConversationPriority
) {
  await requireAuth();

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { priority },
  });

  revalidatePath("/dashboard/" + conversation.brandId + "/inbox");

  return { success: true, conversation };
}

export async function updateConversationTagsAction(
  conversationId: string,
  tags: string[]
) {
  await requireAuth();

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { tags },
  });

  revalidatePath("/dashboard/" + conversation.brandId + "/inbox");

  return { success: true, conversation };
}

export async function archiveConversationAction(conversationId: string) {
  await requireAuth();

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: ConversationStatus.CLOSED },
  });

  revalidatePath("/dashboard/" + conversation.brandId + "/inbox");

  return { success: true, conversation };
}

export async function getInboxStatsAction(brandId: string) {
  await requireAuth();

  const [
    totalConversations,
    newConversations,
    inProgressConversations,
    resolvedConversations,
  ] = await Promise.all([
    prisma.conversation.count({
      where: { brandId },
    }),
    prisma.conversation.count({
      where: {
        brandId,
        status: ConversationStatus.NEW,
      },
    }),
    prisma.conversation.count({
      where: {
        brandId,
        status: ConversationStatus.IN_PROGRESS,
      },
    }),
    prisma.conversation.count({
      where: {
        brandId,
        status: ConversationStatus.RESOLVED,
      },
    }),
  ]);

  return {
    success: true,
    stats: {
      total: totalConversations,
      new: newConversations,
      inProgress: inProgressConversations,
      resolved: resolvedConversations,
      avgResponseTime: 0,
    },
  };
}

export const CANNED_RESPONSES = [
  {
    id: "1",
    category: "Saludos",
    title: "Bienvenida general",
    content: "¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?",
  },
  {
    id: "2",
    category: "Información",
    title: "Horario de atención",
    content: "Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00h.",
  },
  {
    id: "3",
    category: "Despedida",
    title: "Despedida estándar",
    content: "¡Gracias por contactarnos! Si necesitas algo más, no dudes en escribirnos.",
  },
];

export async function getCannedResponsesAction() {
  return { success: true, responses: CANNED_RESPONSES };
}
