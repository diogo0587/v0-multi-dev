import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    const userId = (session.user as any).id as string

    const state = await prisma.projectState.findUnique({
      where: { userId },
    })

    return NextResponse.json({ success: true, state: state?.state || null })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Falha ao carregar estado" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    const userId = (session.user as any).id as string

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 })
    }

    const { messages, tasks, generatedFiles, activities } = body as {
      messages: unknown
      tasks: unknown
      generatedFiles: unknown
      activities: unknown
    }

    const state = { messages, tasks, generatedFiles, activities }

    await prisma.projectState.upsert({
      where: { userId },
      update: { state },
      create: { userId, state },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Falha ao salvar estado" },
      { status: 500 },
    )
  }
}