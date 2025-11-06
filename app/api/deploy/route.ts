import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { hookUrl, message } = (await request.json().catch(() => ({}))) as {
      hookUrl?: string
      message?: string
    }

    const url = hookUrl || process.env.VERCEL_DEPLOY_HOOK_URL

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Hook de deploy não configurado. Defina VERCEL_DEPLOY_HOOK_URL nas variáveis de ambiente ou informe hookUrl na requisição.",
        },
        { status: 400 },
      )
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message || "Deploy acionado automaticamente pelo sistema multiagente" }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { success: false, error: `Falha no hook de deploy: ${res.status} ${res.statusText} - ${text}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Deploy acionado com sucesso via Vercel Deploy Hook.",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro ao acionar deploy" },
      { status: 500 },
    )
  }
}