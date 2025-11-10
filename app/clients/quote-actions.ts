"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createQuoteAction(data: {
  clientId: string
  title: string
  description?: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax?: number
  discount?: number
  total: number
  validUntil?: Date
  notes?: string
}) {
  const user = await requireAuth()

  // Generate quote number
  const year = new Date().getFullYear()
  const lastQuote = await prisma.quote.findFirst({
    where: {
      quoteNumber: {
        startsWith: `QUO-${year}-`,
      },
    },
    orderBy: {
      quoteNumber: "desc",
    },
  })

  let nextNumber = 1
  if (lastQuote) {
    const lastNumber = parseInt(lastQuote.quoteNumber.split("-")[2])
    nextNumber = lastNumber + 1
  }

  const quoteNumber = `QUO-${year}-${nextNumber.toString().padStart(3, "0")}`

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      clientId: data.clientId,
      title: data.title,
      description: data.description,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax || 0,
      discount: data.discount || 0,
      total: data.total,
      validUntil: data.validUntil,
      notes: data.notes,
      createdById: user.id,
    },
  })

  revalidatePath(`/clients/${data.clientId}`)
  revalidatePath("/clients")
  return quote
}

export async function updateQuoteAction(
  quoteId: string,
  data: {
    title?: string
    description?: string
    items?: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
    subtotal?: number
    tax?: number
    discount?: number
    total?: number
    status?: string
    validUntil?: Date
    notes?: string
  }
) {
  await requireAuth()

  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      ...data,
      ...(data.status === "SENT" && !data.hasOwnProperty("sentAt")
        ? { sentAt: new Date() }
        : {}),
      ...(data.status === "ACCEPTED" && !data.hasOwnProperty("acceptedAt")
        ? { acceptedAt: new Date() }
        : {}),
    },
  })

  const fullQuote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true },
  })

  revalidatePath(`/clients/${fullQuote?.clientId}`)
  revalidatePath("/clients")
  return quote
}

export async function deleteQuoteAction(quoteId: string) {
  await requireAuth()

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  })

  await prisma.quote.delete({
    where: { id: quoteId },
  })

  revalidatePath(`/clients/${quote?.clientId}`)
  revalidatePath("/clients")
}

export async function sendQuoteAction(quoteId: string) {
  await requireAuth()

  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  })

  revalidatePath(`/clients/${quote.clientId}`)
  return quote
}

export async function acceptQuoteAction(quoteId: string) {
  await requireAuth()

  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  })

  revalidatePath(`/clients/${quote.clientId}`)
  return quote
}

export async function rejectQuoteAction(quoteId: string) {
  await requireAuth()

  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: "REJECTED",
    },
  })

  revalidatePath(`/clients/${quote.clientId}`)
  return quote
}
