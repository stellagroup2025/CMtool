import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { mode } = body

    if (!["PERSONAL", "AGENCY"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { mode },
    })

    // Note: Session will be updated on next request automatically
    // The user needs to refresh or be redirected for the new mode to take effect

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        mode: updatedUser.mode,
      },
      message: "Mode updated successfully. Redirecting..."
    })
  } catch (error) {
    console.error("Update mode error:", error)
    return NextResponse.json(
      { error: "Error updating mode" },
      { status: 500 }
    )
  }
}
