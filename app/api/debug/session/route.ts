import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()

    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          mode: session.user?.mode,
        }
      } : null,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      authenticated: false,
    })
  }
}
