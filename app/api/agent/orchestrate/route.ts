import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

interface AgentStep {
  agent: string
  status: "pending" | "working" | "completed"
  output?: string
}

async function geminiGenerate({
  apiKey,
  model,
  prompt,
  temperature = 0.7,
}: {
  apiKey: string
  model: string
  prompt: string
  temperature?: number
}): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: 8000 },
    }),
  })
  if (!resp.ok) {
    throw new Error(`Gemini API error: ${resp.status} ${resp.statusText}`)
  }
  const data = await resp.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  return text
}

export async function POST(req: NextRequest) {
  try {
    const { task, apiKey, model = "gemini-2.0-flash-exp", temperature = 0.7 } = await req.json()

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 })
    }

    const steps: AgentStep[] = []

    steps.push({ agent: "Orquestrador", status: "working" })

    const orchestratorPrompt = `Como Orquestrador de uma equipe de desenvolvimento, analise esta tarefa e crie um plano de execução:

Tarefa: ${task}

Agentes disponíveis:
- Analista de Requisitos: Análise detalhada, casos de uso, estrutura de dados
- Dev Frontend: React, Next.js, TypeScript, Tailwind CSS, componentes UI
- Dev Backend: API Routes, Server Actions, validação, integração de dados
- DevOps: Configuração, deploy, otimização

Responda APENAS com JSON válido (sem markdown):
{
  "analise": "análise detalhada da tarefa",
  "tipo_projeto": "landing-page | dashboard | app-completo | componente | api",
  "agentes_necessarios": ["lista de agentes"],
  "ordem_execucao": ["ordem de trabalho"],
  "tecnologias": ["Next.js", "React", "TypeScript", "Tailwind"]
}`

    let orchestratorText = ""
    if (apiKey) {
      orchestratorText = await geminiGenerate({ apiKey, model, prompt: orchestratorPrompt, temperature })
    } else {
      const orchestratorResult = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: orchestratorPrompt,
      })
      orchestratorText = orchestratorResult.text
    }

    const orchestratorAnalysis = extractJSON(orchestratorText)
    steps[0].status = "completed"
    steps[0].output = JSON.stringify(orchestratorAnalysis)

    if (orchestratorAnalysis.agentes_necessarios?.includes("Analista de Requisitos")) {
      steps.push({ agent: "Analista de Requisitos", status: "working" })

      const analystPrompt = `Como Analista de Requisitos, documente esta tarefa:

Tarefa: ${task}
Tipo: ${orchestratorAnalysis.tipo_projeto || "app-completo"}

Forneça em JSON válido (sem markdown):
{
  "requisitos_funcionais": ["lista de requisitos"],
  "componentes_necessarios": ["lista de componentes"],
  "estrutura_dados": {"descrição": "da estrutura"},
  "fluxo_usuario": ["passo 1", "passo 2"],
  "recomendacoes": ["recomendações técnicas"]
}`

      let analystText = ""
      if (apiKey) {
        analystText = await geminiGenerate({ apiKey, model, prompt: analystPrompt, temperature })
      } else {
        const analystResult = await generateText({
          model: "openai/gpt-4o-mini",
          prompt: analystPrompt,
        })
        analystText = analystResult.text
      }

      steps[steps.length - 1].status = "completed"
      steps[steps.length - 1].output = analystText
    }

    if (orchestratorAnalysis.agentes_necessarios?.includes("Dev Frontend")) {
      steps.push({ agent: "Dev Frontend", status: "working" })

      const requirements = steps.find((s) => s.agent === "Analista de Requisitos")?.output || ""

      const frontendPrompt = `Como Dev Frontend especializado em Next.js, crie uma aplicação COMPLETA e FUNCIONAL:

Tarefa: ${task}
Tipo: ${orchestratorAnalysis.tipo_projeto || "app-completo"}

${requirements ? `Requisitos:\n${requirements}\n` : ""}

Crie código PRODUCTION-READY usando:
- Next.js App Router
- TypeScript
- Tailwind CSS v4
- React Server Components
- Componentes shadcn/ui (Button, Card, Input, etc)

IMPORTANTE:
- Gere TODOS os arquivos necessários
- Código deve ser COMPLETO (sem placeholders)
- Use design moderno e responsivo
- Inclua interatividade e estados

Retorne APENAS JSON válido (sem markdown, sem \`\`\`):
{
  "files": [
    {
      "path": "app/page.tsx",
      "content": "código completo aqui com imports e exports",
      "language": "typescript"
    },
    {
      "path": "components/nome-componente.tsx",
      "content": "código completo do componente",
      "language": "typescript"
    }
  ],
  "explicacao": "explicação do que foi criado",
  "features": ["lista de funcionalidades implementadas"]
}`

      let frontendText = ""
      if (apiKey) {
        frontendText = await geminiGenerate({ apiKey, model, prompt: frontendPrompt, temperature })
      } else {
        const frontendResult = await generateText({
          model: "openai/gpt-4o",
          prompt: frontendPrompt,
        })
        frontendText = frontendResult.text
      }

      steps[steps.length - 1].status = "completed"
      steps[steps.length - 1].output = frontendText
    }

    if (orchestratorAnalysis.agentes_necessarios?.includes("Dev Backend")) {
      steps.push({ agent: "Dev Backend", status: "working" })

      const requirements = steps.find((s) => s.agent === "Analista de Requisitos")?.output || ""

      const backendPrompt = `Como Dev Backend especializado em Next.js, crie APIs COMPLETAS:

Tarefa: ${task}

${requirements ? `Requisitos:\n${requirements}\n` : ""}

Crie código PRODUCTION-READY:
- API Routes (app/api/...)
- Server Actions
- Validação com Zod
- Tratamento de erros
- TypeScript types

Retorne APENAS JSON válido (sem markdown):
{
  "files": [
    {
      "path": "app/api/rota/route.ts",
      "content": "código completo da API",
      "language": "typescript"
    }
  ],
  "explicacao": "explicação das APIs criadas",
  "endpoints": ["lista de endpoints"]
}`

      let backendText = ""
      if (apiKey) {
        backendText = await geminiGenerate({ apiKey, model, prompt: backendPrompt, temperature })
      } else {
        const backendResult = await generateText({
          model: "openai/gpt-4o",
          prompt: backendPrompt,
        })
        backendText = backendResult.text
      }

      steps[steps.length - 1].status = "completed"
      steps[steps.length - 1].output = backendText
    }

    const allFiles: Array<{ path: string; content: string; language: string }> = []

    for (const step of steps) {
      if (step.output && step.agent !== "Orquestrador") {
        const parsed = extractJSON(step.output)
        if (parsed.files && Array.isArray(parsed.files)) {
          allFiles.push(...parsed.files)
        }
      }
    }

    return NextResponse.json({
      success: true,
      steps: steps.map((s) => ({
        agent: s.agent,
        status: s.status,
        summary:
          s.agent === "Orquestrador"
            ? orchestratorAnalysis.analise
            : extractJSON(s.output || "{}").explicacao || "Trabalho concluído",
      })),
      files: allFiles,
      projectType: orchestratorAnalysis.tipo_projeto,
      message: `Aplicação criada com sucesso por ${steps.length} agentes!`,
    })
  } catch (error) {
    console.error("[v0] Error in orchestration:", error)
    return NextResponse.json(
      { error: "Failed to orchestrate agents", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

function extractJSON(text: string): any {
  try {
    // tenta capturar JSON entre ```json ... ``` ou o primeiro objeto
    let match = text.match(/```json\s*([\s\S]*?)```/i)
    if (match?.[1]) {
      return JSON.parse(match[1])
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error("[v0] Failed to parse JSON from text:", e)
  }
  return {}
}
