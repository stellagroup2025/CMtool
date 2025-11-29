import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Reset user mode to null
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { mode: null },
    })

    return NextResponse.json({
      success: true,
      message: "User mode reset to null. Please logout and login again to select your mode.",
      user: {
        email: updatedUser.email,
        mode: updatedUser.mode,
      },
    })
  } catch (error) {
    console.error("Reset mode error:", error)
    return NextResponse.json(
      { error: "Error resetting mode" },
      { status: 500 }
    )
  }
}
