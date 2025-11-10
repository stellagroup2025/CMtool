"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createContractAction(data: {
  clientId: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  value: number
  billingCycle?: string
  terms?: string
  notes?: string
}) {
  const user = await requireAuth()

  // Generate contract number
  const year = new Date().getFullYear()
  const lastContract = await prisma.contract.findFirst({
    where: {
      contractNumber: {
        startsWith: `CON-${year}-`,
      },
    },
    orderBy: {
      contractNumber: "desc",
    },
  })

  let nextNumber = 1
  if (lastContract) {
    const lastNumber = parseInt(lastContract.contractNumber.split("-")[2])
    nextNumber = lastNumber + 1
  }

  const contractNumber = `CON-${year}-${nextNumber.toString().padStart(3, "0")}`

  const contract = await prisma.contract.create({
    data: {
      contractNumber,
      clientId: data.clientId,
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      value: data.value,
      billingCycle: data.billingCycle,
      terms: data.terms,
      notes: data.notes,
      createdById: user.id,
    },
  })

  revalidatePath(`/clients/${data.clientId}`)
  revalidatePath("/clients")
  return contract
}

export async function updateContractAction(
  contractId: string,
  data: {
    title?: string
    description?: string
    startDate?: Date
    endDate?: Date
    value?: number
    billingCycle?: string
    status?: string
    terms?: string
    notes?: string
  }
) {
  await requireAuth()

  const contract = await prisma.contract.update({
    where: { id: contractId },
    data: {
      ...data,
      ...(data.status === "ACTIVE" && !data.hasOwnProperty("signedAt")
        ? { signedAt: new Date() }
        : {}),
    },
  })

  const fullContract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { client: true },
  })

  revalidatePath(`/clients/${fullContract?.clientId}`)
  revalidatePath("/clients")
  return contract
}

export async function deleteContractAction(contractId: string) {
  await requireAuth()

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
  })

  await prisma.contract.delete({
    where: { id: contractId },
  })

  revalidatePath(`/clients/${contract?.clientId}`)
  revalidatePath("/clients")
}

export async function activateContractAction(contractId: string) {
  await requireAuth()

  const contract = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: "ACTIVE",
      signedAt: new Date(),
    },
  })

  revalidatePath(`/clients/${contract.clientId}`)
  return contract
}

export async function completeContractAction(contractId: string) {
  await requireAuth()

  const contract = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: "COMPLETED",
    },
  })

  revalidatePath(`/clients/${contract.clientId}`)
  return contract
}

export async function cancelContractAction(contractId: string) {
  await requireAuth()

  const contract = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: "CANCELLED",
    },
  })

  revalidatePath(`/clients/${contract.clientId}`)
  return contract
}
