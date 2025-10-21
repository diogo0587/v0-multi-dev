import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

interface AgentStep {
  agent: string
  status: "pending" | "working" | "completed"
  output?: string
}

export async function POST(req: NextRequest) {
  try {
    const { task, apiKey } = await req.json()

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 })
    }

    const model = "openai/gpt-4o-mini"

    const steps: AgentStep[] = []

    steps.push({ agent: "Orquestrador", status: "working" })

    const orchestratorPrompt = `Como Orquestrador de uma equipe de desenvolvimento, analise esta tarefa e crie um plano de execução:

Tarefa: ${task}

Agentes disponíveis:
- Analista de Requisitos: Análise detalhada, casos de uso, estrutura de dados
- Dev Frontend: React, Next.js 14, TypeScript, Tailwind CSS, componentes UI
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

    const orchestratorResult = await generateText({
      model,
      prompt: orchestratorPrompt,
    })

    const orchestratorAnalysis = extractJSON(orchestratorResult.text)
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

      const analystResult = await generateText({
        model,
        prompt: analystPrompt,
      })

      steps[steps.length - 1].status = "completed"
      steps[steps.length - 1].output = analystResult.text
    }

    if (orchestratorAnalysis.agentes_necessarios?.includes("Dev Frontend")) {
      steps.push({ agent: "Dev Frontend", status: "working" })

      const requirements = steps.find((s) => s.agent === "Analista de Requisitos")?.output || ""

      const frontendPrompt = `Como Dev Frontend especializado em Next.js 14, crie uma aplicação COMPLETA e FUNCIONAL:

Tarefa: ${task}
Tipo: ${orchestratorAnalysis.tipo_projeto || "app-completo"}

${requirements ? `Requisitos:\n${requirements}\n` : ""}

Crie código PRODUCTION-READY usando:
- Next.js 14 App Router
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

      const frontendResult = await generateText({
        model,
        prompt: frontendPrompt,
      })

      steps[steps.length - 1].status = "completed"
      steps[steps.length - 1].output = frontendResult.text
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

      const backendResult = await generateText({
        model,
        prompt: backendPrompt,
      })

      steps[steps.length - 1].status = "completed"
      steps[steps.length - 1].output = backendResult.text
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
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error("[v0] Failed to parse JSON from text:", e)
  }
  return {}
}
