import { generateText } from "ai"
import { NextResponse } from "next/server"
import type { AgentRole } from "@/lib/types/agent"

interface GeneratedFile {
  path: string
  content: string
  language: string
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

IMPORTANTE: Retorne APENAS um JSON válido no formato:
{
  "files": [
    {
      "path": "caminho/do/arquivo.tsx",
      "content": "código completo aqui",
      "language": "typescript"
    }
  ],
  "description": "descrição do que foi criado"
}`,

  "backend-dev": `Você é um Dev Backend especialista em Next.js API Routes e Server Actions.
Gere código COMPLETO e FUNCIONAL:
- Use TypeScript
- Crie API routes ou server actions
- Inclua validação de dados
- Trate erros adequadamente
- Use Next.js 14+ patterns

IMPORTANTE: Retorne APENAS um JSON válido no formato:
{
  "files": [
    {
      "path": "caminho/do/arquivo.ts",
      "content": "código completo aqui",
      "language": "typescript"
    }
  ],
  "description": "descrição do que foi criado"
}`,

  devops: `Você é um DevOps especialista. Crie configurações e workflows completos.`,
}

export async function POST(request: Request) {
  try {
    const { taskDescription, agentRole, apiKey, model = "gemini-2.0-flash-exp" } = await request.json()

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
                      text: `${systemPrompt}\n\nTarefa: ${taskDescription}\n\nGere o código COMPLETO e FUNCIONAL para esta tarefa. Retorne um JSON válido com os arquivos gerados. Não inclua explicações fora do JSON.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
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

        let jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            jsonMatch[0] = jsonMatch[1]
          }
        }

        if (!jsonMatch) {
          return NextResponse.json(
            {
              error: "Failed to parse AI response",
              rawResponse: text,
            },
            { status: 500 },
          )
        }

        const result = JSON.parse(jsonMatch[0])
        const files: GeneratedFile[] = result.files || []

        return NextResponse.json({
          success: true,
          files,
          description: result.description || "Arquivos gerados com sucesso",
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
Retorne um JSON válido com os arquivos gerados.
Não inclua explicações fora do JSON.`,
      temperature: 0.7,
      maxTokens: 4000,
    })

    console.log("[v0] AI Response:", text)

    let jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Tentar encontrar JSON em blocos de código
      jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1]
      }
    }

    if (!jsonMatch) {
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          rawResponse: text,
        },
        { status: 500 },
      )
    }

    const result = JSON.parse(jsonMatch[0])
    const files: GeneratedFile[] = result.files || []

    return NextResponse.json({
      success: true,
      files,
      description: result.description || "Arquivos gerados com sucesso",
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
