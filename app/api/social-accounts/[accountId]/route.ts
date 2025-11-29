import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { accountId } = params

    // Get the account to verify brand access
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId },
      include: {
        brand: {
          include: {
            memberships: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!account || account.brand.memberships.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Soft delete - mark as inactive
    await prisma.socialAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting social account:", error)
    return NextResponse.json(
      { error: "Error deleting social account" },
      { status: 500 }
    )
  }
}
