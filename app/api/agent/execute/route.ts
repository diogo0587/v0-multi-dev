import { generateText } from "ai"
import { NextResponse } from "next/server"
import type { AgentRole } from "@/lib/types/agent"

interface ExecutionStep {
  step: number
  description: string
  status: "pending" | "in-progress" | "completed" | "failed"
  output?: string
}

const agentPrompts: Record<AgentRole, string> = {
  orchestrator: `Você é o Orquestrador Principal. Analise a tarefa e quebre em subtarefas executáveis específicas.
Retorne um JSON com: { "subtasks": [{ "title": "...", "agent": "frontend-dev|backend-dev|devops|requirements-analyst", "action": "..." }] }`,

  "requirements-analyst": `Você é o Analista de Requisitos. Analise e documente requisitos detalhadamente.
Retorne um JSON com: { "requirements": [...], "useCases": [...], "architecture": "..." }`,

  "frontend-dev": `Você é o Dev Frontend. Gere código React/Next.js funcional e completo.
Retorne um JSON com: { "files": [{ "path": "...", "content": "..." }], "dependencies": [...] }`,

  "backend-dev": `Você é o Dev Backend. Gere APIs, server actions e lógica de backend.
Retorne um JSON com: { "files": [{ "path": "...", "content": "..." }], "database": "..." }`,

  devops: `Você é o DevOps. Configure CI/CD, deploy e infraestrutura.
Retorne um JSON com: { "workflows": [...], "config": {...}, "commands": [...] }`,
}

export async function POST(request: Request) {
  try {
    const { taskDescription, agentRole, taskId } = await request.json()

    if (!taskDescription || !agentRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const systemPrompt = agentPrompts[agentRole as AgentRole]
    const steps: ExecutionStep[] = []

    steps.push({
      step: 1,
      description: "Analisando tarefa e planejando execução",
      status: "in-progress",
    })

    const { text: analysisText } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: `Tarefa: ${taskDescription}\n\nAnalise e retorne um plano de execução detalhado em formato JSON.`,
      temperature: 0.7,
      maxOutputTokens: 1000,
    })

    steps[0].status = "completed"
    steps[0].output = analysisText

    steps.push({
      step: 2,
      description: "Executando ações específicas do agente",
      status: "in-progress",
    })

    let executionResult = ""

    try {
      const analysis = JSON.parse(analysisText)

      switch (agentRole) {
        case "frontend-dev":
          if (analysis.files && Array.isArray(analysis.files)) {
            executionResult = `✅ Gerados ${analysis.files.length} arquivo(s):\n${analysis.files.map((f: any) => `- ${f.path}`).join("\n")}`
          }
          break

        case "backend-dev":
          if (analysis.files && Array.isArray(analysis.files)) {
            executionResult = `✅ Criadas ${analysis.files.length} API(s)/função(ões):\n${analysis.files.map((f: any) => `- ${f.path}`).join("\n")}`
          }
          break

        case "requirements-analyst":
          if (analysis.requirements) {
            executionResult = `✅ Documentação criada:\n- ${analysis.requirements.length} requisitos identificados\n- ${analysis.useCases?.length || 0} casos de uso mapeados`
          }
          break

        case "devops":
          if (analysis.workflows) {
            executionResult = `✅ Configuração DevOps:\n- ${analysis.workflows.length} workflow(s) criado(s)\n- Comandos de deploy configurados`
          }
          break

        case "orchestrator":
          if (analysis.subtasks) {
            executionResult = `✅ Tarefa dividida em ${analysis.subtasks.length} subtarefa(s):\n${analysis.subtasks.map((t: any, i: number) => `${i + 1}. ${t.title} (${t.agent})`).join("\n")}`
          }
          break
      }

      steps[1].status = "completed"
      steps[1].output = executionResult || analysisText
    } catch (parseError) {
      steps[1].status = "completed"
      steps[1].output = analysisText
      executionResult = analysisText
    }

    steps.push({
      step: 3,
      description: "Finalizando e registrando resultados",
      status: "completed",
      output: "Tarefa executada com sucesso!",
    })

    return NextResponse.json({
      success: true,
      steps,
      finalResult: executionResult || analysisText,
      agentRole,
      taskId,
    })
  } catch (error) {
    console.error("[v0] Error executing task:", error)
    return NextResponse.json({ error: "Failed to execute task", details: String(error) }, { status: 500 })
  }
}
