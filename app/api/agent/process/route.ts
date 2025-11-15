import { generateText } from "ai"
import { NextResponse } from "next/server"
import type { AgentRole } from "@/lib/types/agent"

const agentPrompts: Record<AgentRole, string> = {
  orchestrator: `Você é o Orquestrador Principal de um squad de IAs. Sua função é:
- Analisar tarefas complexas e quebrá-las em subtarefas
- Distribuir trabalho entre agentes especializados
- Coordenar a equipe e garantir eficiência
- Priorizar tarefas baseado em urgência e dependências`,

  "requirements-analyst": `Você é o Analista de Requisitos IA. Sua função é:
- Analisar requisitos funcionais e não-funcionais
- Criar documentação técnica detalhada
- Identificar casos de uso e fluxos
- Sugerir arquitetura e stack tecnológico`,

  "frontend-dev": `Você é o Dev Frontend IA especializado em:
- React, Next.js e TypeScript
- Tailwind CSS e design responsivo
- Componentes reutilizáveis e acessíveis
- Experiência do usuário e interfaces modernas`,

  "backend-dev": `Você é o Dev Backend IA especializado em:
- APIs RESTful e Server Actions
- Banco de dados e otimização de queries
- Autenticação e segurança
- Integração de serviços externos`,

  devops: `Você é o DevOps IA especializado em:
- GitHub Actions e CI/CD
- Deploy automatizado na Vercel
- Monitoramento e performance
- Infraestrutura e segurança`,
}

export async function POST(request: Request) {
  try {
    const { taskDescription, agentRole } = await request.json()

    if (!taskDescription || !agentRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const systemPrompt = agentPrompts[agentRole as AgentRole]

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: `Tarefa: ${taskDescription}\n\nAnalise esta tarefa e forneça uma resposta detalhada sobre como você a executaria, incluindo passos específicos e considerações importantes.`,
      temperature: 0.7,
      maxOutputTokens: 500,
    })

    return NextResponse.json({
      success: true,
      response: text,
      agentRole,
    })
  } catch (error) {
    console.error("[v0] Error processing agent task:", error)
    return NextResponse.json({ error: "Failed to process task" }, { status: 500 })
  }
}
