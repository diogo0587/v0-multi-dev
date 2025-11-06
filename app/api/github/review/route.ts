import { NextResponse } from "next/server"

function getEnv(name: string) {
  return process.env[name] || process.env[name.toLowerCase()] || ""
}

async function githubRequest(
  method: "GET" | "POST" | "PATCH",
  url: string,
  token: string,
  body?: unknown,
) {
  const resp = await fetch(url, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`GitHub API ${method} ${url} -> ${resp.status}: ${text}`)
  }
  return resp.json()
}

async function resolveTargetPr(repo: string, token: string, preferredPr?: number) {
  if (preferredPr) return preferredPr
  // pega PR aberto mais recente, priorizando branches ai/*
  const pulls: any[] = await githubRequest(
    "GET",
    `https://api.github.com/repos/${repo}/pulls?state=open&sort=created&direction=desc`,
    token,
  )
  if (!pulls || pulls.length === 0) return undefined
  const ai = pulls.find((p) => p?.head?.ref?.startsWith?.("ai/"))
  return (ai || pulls[0]).number as number
}

export async function POST(request: Request) {
  try {
    const token = getEnv("GITHUB_TOKEN")
    const repo = getEnv("GITHUB_REPO")
    if (!token || !repo) {
      return NextResponse.json(
        { success: false, error: "Configure GITHUB_TOKEN e GITHUB_REPO nas variáveis de ambiente" },
        { status: 400 },
      )
    }

    const { comment, prNumber, mode }: { comment: string; prNumber?: number; mode?: "comment" | "append" } =
      await request.json()

    if (!comment || typeof comment !== "string") {
      return NextResponse.json({ success: false, error: "Campo 'comment' é obrigatório" }, { status: 400 })
    }

    const pr = await resolveTargetPr(repo, token, prNumber)
    if (!pr) {
      return NextResponse.json({ success: false, error: "Nenhum PR aberto encontrado" }, { status: 404 })
    }

    if (mode === "append") {
      // Anexa ao corpo do PR
      const prData: any = await githubRequest("GET", `https://api.github.com/repos/${repo}/pulls/${pr}`, token)
      const currentBody = prData.body || ""
      const newBody = `${currentBody}\n\n---\n${comment}`
      await githubRequest(
        "PATCH",
        `https://api.github.com/repos/${repo}/pulls/${pr}`,
        token,
        { body: newBody },
      )
      return NextResponse.json({
        success: true,
        prNumber: pr,
        url: prData.html_url as string,
        mode: "append",
        message: "Comentário anexado à descrição do PR",
      })
    } else {
      // Cria comentário
      const cmt: any = await githubRequest(
        "POST",
        `https://api.github.com/repos/${repo}/issues/${pr}/comments`,
        token,
        { body: comment },
      )
      return NextResponse.json({
        success: true,
        prNumber: pr,
        url: cmt.html_url as string,
        mode: "comment",
        message: "Comentário publicado no PR",
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Falha ao publicar comentário" },
      { status: 500 },
    )
  }
}