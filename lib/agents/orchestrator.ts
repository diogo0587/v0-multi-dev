import type { Agent, Task, AgentRole } from "@/lib/types/agent"

export class OrchestratorAgent {
  private agent: Agent

  constructor() {
    this.agent = {
      id: "orchestrator-001",
      role: "orchestrator",
      name: "Orquestrador Principal",
      description: "Coordena e distribui tarefas entre os agentes especializados",
      status: "idle",
      capabilities: [
        "Análise de requisitos complexos",
        "Distribuição inteligente de tarefas",
        "Coordenação de equipe",
        "Priorização de trabalho",
        "Resolução de conflitos",
      ],
      avatar: "🎯",
    }
  }

  getAgent(): Agent {
    return this.agent
  }

  analyzeTask(taskDescription: string): Task[] {
    const taskId = `task-${Date.now()}`

    return [
      {
        id: `${taskId}-1`,
        title: "Análise de Requisitos",
        description: "Analisar e documentar requisitos do projeto",
        assignedTo: "requirements-analyst",
        status: "pending",
        priority: "high",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }

  distributeTask(task: Task): AgentRole {
    const keywords = task.description.toLowerCase()

    if (keywords.includes("interface") || keywords.includes("ui") || keywords.includes("frontend")) {
      return "frontend-dev"
    } else if (keywords.includes("api") || keywords.includes("database") || keywords.includes("backend")) {
      return "backend-dev"
    } else if (keywords.includes("deploy") || keywords.includes("ci/cd") || keywords.includes("infraestrutura")) {
      return "devops"
    } else {
      return "requirements-analyst"
    }
  }

  updateStatus(status: Agent["status"], currentTask?: string) {
    this.agent.status = status
    this.agent.currentTask = currentTask
  }
}
