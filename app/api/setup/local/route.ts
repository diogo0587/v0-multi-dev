import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

type EnvPayload = {
  DATABASE_URL?: string
  DIRECT_URL?: string
  NEXTAUTH_SECRET?: string
  ADMIN_EMAIL?: string
  ADMIN_PASSWORD?: string
  GEMINI_API_KEY?: string
  GITHUB_TOKEN?: string
  GITHUB_REPO?: string
  GITHUB_BASE_BRANCH?: string
  VERCEL_DEPLOY_HOOK_URL?: string
}

/**
 * Writes .env.local at the repo root with provided variables.
 * Only intended for local/dev environment. In serverless prod, filesystem may be read-only.
 */
export async function POST(request: Request) {
  try {
    const body: EnvPayload = await request.json()
    const lines: string[] = []

    const add = (key: string, value?: string) => {
      if (value && value.trim().length > 0) {
        // escape newlines
        const v = value.replace(/\r?\n/g, "\\n")
        lines.push(`${key}=${v}`)
      }
    }

    add("DATABASE_URL", body.DATABASE_URL)
    add("DIRECT_URL", body.DIRECT_URL)
    add("NEXTAUTH_SECRET", body.NEXTAUTH_SECRET)
    add("ADMIN_EMAIL", body.ADMIN_EMAIL)
    add("ADMIN_PASSWORD", body.ADMIN_PASSWORD)
    add("GEMINI_API_KEY", body.GEMINI_API_KEY)
    add("GITHUB_TOKEN", body.GITHUB_TOKEN)
    add("GITHUB_REPO", body.GITHUB_REPO)
    add("GITHUB_BASE_BRANCH", body.GITHUB_BASE_BRANCH)
    add("VERCEL_DEPLOY_HOOK_URL", body.VERCEL_DEPLOY_HOOK_URL)

    if (lines.length === 0) {
      return NextResponse.json({ success: false, error: "Nenhuma variável enviada" }, { status: 400 })
    }

    const envContent = lines.join("\n") + "\n"
    const filePath = path.join(process.cwd(), ".env.local")

    await fs.writeFile(filePath, envContent, { encoding: "utf8" })

    return NextResponse.json({
      success: true,
      message: ".env.local gravado com sucesso",
      file: ".env.local",
      vars: lines.map((l) => l.split("=")[0]),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Falha ao gravar .env.local" },
      { status: 500 },
    )
  }
}