import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

type GeneratedFile = {
  path: string
  content: string
  language?: string
}

async function writeFileSafe(root: string, filePath: string, content: string) {
  const normalized = filePath.replace(/^\/+/, "")
  const target = path.resolve(root, normalized)
  if (!target.startsWith(root)) {
    throw new Error(`Caminho inválido: ${filePath}`)
  }
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content, "utf8")
  return target
}

async function applyViaFS(files: GeneratedFile[]) {
  const root = process.cwd()
  const applied: string[] = []
  for (const f of files) {
    const target = await writeFileSafe(root, f.path, f.content)
    applied.push(path.relative(root, target))
  }
  return { mode: "fs" as const, appliedFiles: applied }
}

function getEnv(name: string) {
  return process.env[name] || process.env[name.toLowerCase()] || ""
}

async function githubRequest(
  method: "GET" | "POST" | "PATCH" | "PUT",
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

async function ensureBranch(repo: string, token: string, baseBranch: string, newBranch: string) {
  let baseRef: any
  try {
    baseRef = await githubRequest("GET", `https://api.github.com/repos/${repo}/git/ref/heads/${baseBranch}`, token)
  } catch {
    baseRef = await githubRequest("GET", `https://api.github.com/repos/${repo}/git/ref/heads/main`, token)
    baseBranch = "main"
  }
  const sha = baseRef.object.sha
  await githubRequest("POST", `https://api.github.com/repos/${repo}/git/refs`, token, {
    ref: `refs/heads/${newBranch}`,
    sha,
  })
  return { baseBranch }
}

async function applyViaGitHub(files: GeneratedFile[], commitMessage?: string) {
  const token = getEnv("GITHUB_TOKEN")
  const repo = getEnv("GITHUB_REPO") // formato: owner/nome
  let baseBranch = getEnv("GITHUB_BASE_BRANCH") || "main"

  if (!token || !repo) {
    throw new Error("Variáveis GITHUB_TOKEN e GITHUB_REPO não configuradas")
  }

  const branch = `ai/generated-${Date.now()}`
  await ensureBranch(repo, token, baseBranch, branch)

  for (const f of files) {
    const pathNormalized = f.path.replace(/^\/+/, "")
    const contentB64 = Buffer.from(f.content, "utf8").toString("base64")
    await githubRequest(
      "PUT",
      `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(pathNormalized)}?ref=${encodeURIComponent(
        branch,
      )}`,
      token,
      {
        message: (commitMessage || "feat(ai): aplicar arquivos gerados") + ` - ${pathNormalized}`,
        content: contentB64,
        branch,
      },
    )
  }

  const pr: any = await githubRequest("POST", `https://api.github.com/repos/${repo}/pulls`, token, {
    title: `feat(ai): aplicar arquivos gerados (${files.length})`,
    head: branch,
    base: baseBranch,
    body:
      "Este PR foi criado automaticamente para aplicar os arquivos gerados pelo sistema multiagente.\n\n" +
      "- Verifique as alterações e faça o merge quando estiver pronto.",
  })

  return { mode: "github" as const, prUrl: pr.html_url as string, branch }
}

export async function POST(request: Request) {
  try {
    const { files, commitMessage }: { files: GeneratedFile[]; commitMessage?: string } = await request.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo recebido" }, { status: 400 })
    }

    const hasGitHub = !!getEnv("GITHUB_TOKEN") && !!getEnv("GITHUB_REPO")

    if (hasGitHub) {
      const result = await applyViaGitHub(files, commitMessage)
      return NextResponse.json({
        success: true,
        ...result,
        message: "Arquivos aplicados via Pull Request no GitHub",
      })
    }

    const result = await applyViaFS(files)
    return NextResponse.json({
      success: true,
      ...result,
      message: "Arquivos aplicados no filesystem do servidor (ambiente de desenvolvimento)",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Falha ao aplicar arquivos",
      },
      { status: 500 },
    )
  }
}