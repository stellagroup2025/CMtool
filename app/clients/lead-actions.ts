"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getLeadsAction() {
  await requireAuth()

  const leads = await prisma.lead.findMany({
    where: {
      isActive: true,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return leads
}

export async function createLeadAction(data: {
  companyName: string
  contactName: string
  contactEmail?: string
  contactPhone?: string
  source?: string
  estimatedValue?: number
  probability?: number
  expectedCloseDate?: Date
  notes?: string
  clientId?: string
}) {
  const user = await requireAuth()

  const lead = await prisma.lead.create({
    data: {
      ...data,
      assignedTo: user.id,
    },
  })

  revalidatePath("/clients")
  revalidatePath("/leads")
  return lead
}

export async function updateLeadAction(
  leadId: string,
  data: {
    companyName?: string
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    status?: string
    source?: string
    estimatedValue?: number
    probability?: number
    expectedCloseDate?: Date
    notes?: string
    clientId?: string
    assignedTo?: string
    lastContactDate?: Date
    nextFollowUpDate?: Date
    isActive?: boolean
  }
) {
  await requireAuth()

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data,
  })

  revalidatePath("/clients")
  revalidatePath("/leads")
  return lead
}

export async function deleteLeadAction(leadId: string) {
  await requireAuth()

  // Soft delete
  await prisma.lead.update({
    where: { id: leadId },
    data: { isActive: false },
  })

  revalidatePath("/clients")
  revalidatePath("/leads")
}

export async function convertLeadToClientAction(leadId: string) {
  await requireAuth()

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) {
    throw new Error("Lead no encontrado")
  }

  // If already has a client, just update the lead status
  if (lead.clientId) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "WON",
      },
    })
    return { clientId: lead.clientId }
  }

  // Create a new client from the lead
  const client = await prisma.client.create({
    data: {
      name: lead.companyName,
      email: lead.contactEmail,
      phone: lead.contactPhone,
      notes: lead.notes,
    },
  })

  // Update the lead to reference the new client
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      clientId: client.id,
      status: "WON",
    },
  })

  revalidatePath("/clients")
  revalidatePath("/leads")
  return { clientId: client.id }
}

export async function markLeadAsLostAction(leadId: string, reason?: string) {
  await requireAuth()

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "LOST",
      notes: reason
        ? `${(await prisma.lead.findUnique({ where: { id: leadId } }))?.notes || ""}\n\nMotivo de pérdida: ${reason}`
        : undefined,
    },
  })

  revalidatePath("/clients")
  revalidatePath("/leads")
  return lead
}

export async function updateLeadStatusAction(leadId: string, status: string) {
  await requireAuth()

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: status as any,
      ...(status === "CONTACTED" ? { lastContactDate: new Date() } : {}),
    },
  })

  revalidatePath("/clients")
  revalidatePath("/leads")
  return lead
}
