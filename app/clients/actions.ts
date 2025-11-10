"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getClientsAction() {
  await requireAuth()

  const clients = await prisma.client.findMany({
    where: {
      isActive: true,
    },
    include: {
      _count: {
        select: {
          brands: true,
          quotes: true,
          contracts: {
            where: {
              status: "ACTIVE",
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return clients.map((client) => ({
    ...client,
    brandCount: client._count.brands,
    quoteCount: client._count.quotes,
    activeContractCount: client._count.contracts,
  }))
}

export async function getClientsListAction() {
  await requireAuth()

  const clients = await prisma.client.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return clients
}

export async function createClientAction(data: {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  taxId?: string
  website?: string
  notes?: string
}) {
  await requireAuth()

  const client = await prisma.client.create({
    data: {
      ...data,
      country: data.country || "España",
    },
  })

  revalidatePath("/clients")
  return client
}

export async function updateClientAction(
  clientId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
    taxId?: string
    website?: string
    notes?: string
    isActive?: boolean
  }
) {
  await requireAuth()

  const client = await prisma.client.update({
    where: { id: clientId },
    data,
  })

  revalidatePath("/clients")
  revalidatePath(`/clients/${clientId}`)
  return client
}

export async function deleteClientAction(clientId: string) {
  await requireAuth()

  // Soft delete
  await prisma.client.update({
    where: { id: clientId },
    data: { isActive: false },
  })

  revalidatePath("/clients")
}

export async function getClientDetailAction(clientId: string) {
  await requireAuth()

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      brands: {
        include: {
          socialAccounts: {
            where: { isActive: true },
          },
          _count: {
            select: {
              posts: true,
              conversations: {
                where: { status: "NEW" },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      quotes: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      contracts: {
        orderBy: {
          startDate: "desc",
        },
      },
    },
  })

  if (!client) {
    throw new Error("Cliente no encontrado")
  }

  return {
    ...client,
    brands: client.brands.map((brand) => ({
      ...brand,
      accountCount: brand.socialAccounts.length,
      postCount: brand._count.posts,
      pendingConversations: brand._count.conversations,
    })),
  }
}
