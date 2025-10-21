"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface AgentStep {
  agent: string
  status: "pending" | "working" | "completed"
  summary?: string
}

interface AgentProgressProps {
  steps: AgentStep[]
}

export function AgentProgress({ steps }: AgentProgressProps) {
  const getAgentIcon = (agent: string) => {
    const icons: Record<string, string> = {
      Orquestrador: "🎯",
      "Analista de Requisitos": "📋",
      "Dev Frontend": "🎨",
      "Dev Backend": "⚙️",
      DevOps: "🚀",
    }
    return icons[agent] || "👤"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "working":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      completed: "default",
      working: "secondary",
      pending: "outline",
    }
    const labels: Record<string, string> = {
      completed: "Concluído",
      working: "Trabalhando",
      pending: "Aguardando",
    }
    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getAgentIcon(step.agent)}</span>
                <h4 className="font-semibold text-sm">{step.agent}</h4>
                {getStatusBadge(step.status)}
              </div>
              {step.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{step.summary}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
