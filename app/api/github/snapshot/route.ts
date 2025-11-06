import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

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

const EXCLUDE_DIRS = new Set(["node_modules", ".next", ".git", ".vercel"])
const EXCLUDE_FILES = new Set<string>([])

async function listFiles(root: string, dir = ""): Promise<string[]> {
  const full = path.join(root, dir)
  const entries = await fs.readdir(full, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    if (e.name.startsWith(".")) {
      // keep .github
      if (e.name !== ".github") continue
    }
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue
      const nested = await listFiles(root, path.join(dir, e.name))
      files.push(...nested)
    } else {
      if (EXCLUDE_FILES.has(e.name)) continue
      const rel = path.join(dir, e.name)
      files.push(rel)
    }
  }
  return files
}

async function getFileSha(repo: string, token: string, pathName: string, branch: string) {
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(pathName)}?ref=${encodeURIComponent(
    branch,
  )}`
  try {
    const data: any = await githubRequest("GET", url, token)
    return data.sha as string
  } catch {
    return undefined
  }
}

export async function POST(request: Request) {
  try {
    const token = getEnv("GITHUB_TOKEN")
    const repo = getEnv("GITHUB_REPO")
    let baseBranch = getEnv("GITHUB_BASE_BRANCH") || "main"

    if (!token || !repo) {
      return NextResponse.json(
        { success: false, error: "Configure GITHUB_TOKEN e GITHUB_REPO nas variáveis de ambiente do servidor." },
        { status: 400 },
      )
    }

    const { message, branchName, direct } = (await request.json().catch(() => ({}))) as {
      message?: string
      branchName?: string
      direct?: boolean
    }

    const root = process.cwd()
    const files = await listFiles(root)

    if (direct) {
      // Commit direto em baseBranch (um commit por arquivo via contents API)
      for (const relPath of files) {
        const abs = path.join(root, relPath)
        const buf = await fs.readFile(abs)
        const contentB64 = buf.toString("base64")
        const existingSha = await getFileSha(repo, token, relPath, baseBranch).catch(() => undefined)
        const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(
          relPath,
        )}?ref=${encodeURIComponent(baseBranch)}`
        await githubRequest("PUT", url, token, {
          message: (message || "chore(ai): snapshot do repositório (direto)") + ` - ${relPath}`,
          content: contentB64,
          branch: baseBranch,
          sha: existingSha,
        })
      }
      return NextResponse.json({
        success: true,
        mode: "direct",
        branch: baseBranch,
        message: `Snapshot aplicado diretamente em ${baseBranch} (${files.length} arquivo(s))`,
        url: `https://github.com/${repo}/tree/${encodeURIComponent(baseBranch)}`,
      })
    }

    const branch = branchName || `ai/snapshot-${Date.now()}`
    await ensureBranch(repo, token, baseBranch, branch)

    // Commit cada arquivo via contents API na branch de snapshot
    for (const relPath of files) {
      const abs = path.join(root, relPath)
      const buf = await fs.readFile(abs)
      const contentB64 = buf.toString("base64")
      const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(relPath)}?ref=${encodeURIComponent(
        branch,
      )}`
      await githubRequest("PUT", url, token, {
        message: (message || "chore(ai): snapshot do repositório") + ` - ${relPath}`,
        content: contentB64,
        branch,
      })
    }

    const pr: any = await githubRequest("POST", `https://api.github.com/repos/${repo}/pulls`, token, {
      title: message || `chore(ai): snapshot do repositório`,
      head: branch,
      base: baseBranch,
      body:
        "Snapshot completo do repositório gerado automaticamente pelo sistema multiagente.\n\n" +
        "Este PR contém o estado atual dos arquivos do projeto.",
    })

    // adiciona label para automerge por workflow
    try {
      await githubRequest("POST", `https://api.github.com/repos/${repo}/issues/${pr.number}/labels`, token, {
        labels: ["ai-generated"],
      })
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, prUrl: pr.html_url as string, branch, prNumber: pr.number, mode: "pr" })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Falha ao criar snapshot no GitHub" },
      { status: 500 },
    )
  }
}