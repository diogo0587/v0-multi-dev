import { generateText } from "ai"
import { NextResponse } from "next/server"
import type { AgentRole } from "@/lib/types/agent"

interface GeneratedFile {
  path: string
  content: string
  language: string
}

function inferLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    css: "css",
    html: "html",
    json: "json",
    md: "markdown",
  }
  return languageMap[ext || ""] || "plaintext"
}

function normalizeFiles(data: any): GeneratedFile[] {
  // Handle both "files" and "arquivos" keys
  const rawFiles = data.files || data.arquivos || []

  return rawFiles.map((file: any) => ({
    path: file.path || file.nome || file.name || "untitled.txt",
    content: file.content || file.conteudo || file.code || "",
    language: file.language || file.linguagem || inferLanguage(file.path || file.nome || file.name || ""),
  }))
}

const agentPrompts: Record<AgentRole, string> = {
  orchestrator: `Você é o Orquestrador Principal. Analise a tarefa e distribua para os agentes apropriados.`,

  "requirements-analyst": `Você é o Analista de Requisitos. Crie documentação técnica completa em Markdown.`,

  "frontend-dev": `Você é um Dev Frontend especialista em React/Next.js. 
Gere código COMPLETO e FUNCIONAL seguindo as melhores práticas:
- Use TypeScript
- Use Tailwind CSS para estilização
- Crie componentes modulares e reutilizáveis
- Use shadcn/ui quando apropriado
- Inclua imports corretos
- Código deve estar pronto para uso

IMPORTANTE: Retorne APENAS um JSON válido EXATAMENTE neste formato (sem texto adicional):
{
  "files": [
    {
      "path": "components/exemplo.tsx",
      "content": "código completo aqui",
      "language": "typescript"
    }
  ],
  "description": "descrição do que foi criado"
}

EXEMPLO DE RESPOSTA VÁLIDA:
{
  "files": [
    {
      "path": "components/button.tsx",
      "content": "import React from 'react'\\n\\nexport function Button() {\\n  return <button>Click me</button>\\n}",
      "language": "typescript"
    }
  ],
  "description": "Componente de botão criado"
}`,

  "backend-dev": `Você é um Dev Backend especialista em Next.js API Routes e Server Actions.
Gere código COMPLETO e FUNCIONAL:
- Use TypeScript
- Crie API routes ou server actions
- Inclua validação de dados
- Trate erros adequadamente
- Use Next.js 14+ patterns

IMPORTANTE: Retorne APENAS um JSON válido EXATAMENTE neste formato (sem texto adicional):
{
  "files": [
    {
      "path": "app/api/exemplo/route.ts",
      "content": "código completo aqui",
      "language": "typescript"
    }
  ],
  "description": "descrição do que foi criado"
}`,

  devops: `Você é um DevOps especialista. Crie configurações e workflows completos.
  
IMPORTANTE: Retorne APENAS um JSON válido EXATAMENTE neste formato (sem texto adicional):
{
  "files": [
    {
      "path": ".github/workflows/deploy.yml",
      "content": "código completo aqui",
      "language": "yaml"
    }
  ],
  "description": "descrição do que foi criado"
}`,
}

export async function POST(request: Request) {
  try {
    const {
      taskDescription,
      agentRole,
      apiKey,
      model = "gemini-2.0-flash-exp",
      temperature = 0.7,
    } = await request.json()

    if (!taskDescription || !agentRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const systemPrompt = agentPrompts[agentRole as AgentRole]

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemPrompt}\n\nTarefa: ${taskDescription}\n\nGere o código COMPLETO e FUNCIONAL para esta tarefa. Retorne APENAS um JSON válido com os arquivos gerados. Não inclua explicações, markdown ou texto fora do JSON.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature,
                maxOutputTokens: 8000,
              },
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`)
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

        console.log("[v0] Gemini Response:", text)

        let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1]
        } else {
          jsonMatch = text.match(/\{[\s\S]*\}/)
        }

        if (!jsonMatch) {
          return NextResponse.json(
            {
              error: "Failed to parse AI response - no JSON found",
              rawResponse: text.substring(0, 500),
            },
            { status: 500 },
          )
        }

        const result = JSON.parse(jsonMatch[0])
        const files: GeneratedFile[] = normalizeFiles(result)

        if (files.length === 0) {
          return NextResponse.json(
            {
              error: "No files generated",
              rawResponse: text.substring(0, 500),
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          files,
          description: result.description || result.descricao || "Arquivos gerados com sucesso",
          agentRole,
          usedGemini: true,
        })
      } catch (geminiError) {
        console.error("[v0] Gemini API error, falling back to default:", geminiError)
        // Fall through to use default AI SDK
      }
    }

    const { text } = await generateText({
      model: "openai/gpt-4o",
      system: systemPrompt,
      prompt: `Tarefa: ${taskDescription}

Gere o código COMPLETO e FUNCIONAL para esta tarefa. 
Retorne APENAS um JSON válido com os arquivos gerados.
Não inclua explicações, markdown ou texto fora do JSON.`,
      temperature,
      maxTokens: 4000,
    })

    console.log("[v0] AI Response:", text)

    let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonMatch[0] = jsonMatch[1]
    } else {
      jsonMatch = text.match(/\{[\s\S]*\}/)
    }

    if (!jsonMatch) {
      return NextResponse.json(
        {
          error: "Failed to parse AI response - no JSON found",
          rawResponse: text.substring(0, 500),
        },
        { status: 500 },
      )
    }

    const result = JSON.parse(jsonMatch[0])
    const files: GeneratedFile[] = normalizeFiles(result)

    if (files.length === 0) {
      return NextResponse.json(
        {
          error: "No files generated",
          rawResponse: text.substring(0, 500),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      files,
      description: result.description || result.descricao || "Arquivos gerados com sucesso",
      agentRole,
    })
  } catch (error) {
    console.error("[v0] Error generating files:", error)
    return NextResponse.json(
      {
        error: "Failed to generate files",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
