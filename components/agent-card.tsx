"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Agent } from "@/lib/types/agent"
import { cn } from "@/lib/utils"

interface AgentCardProps {
  agent: Agent
}

const statusColors = {
  idle: "bg-muted text-muted-foreground",
  working: "bg-chart-4 text-background",
  completed: "bg-chart-2 text-background",
  error: "bg-destructive text-destructive-foreground",
}

const statusLabels = {
  idle: "Disponível",
  working: "Trabalhando",
  completed: "Concluído",
  error: "Erro",
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{agent.avatar}</div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-sm">{agent.description}</CardDescription>
            </div>
          </div>
          <Badge className={cn("text-xs font-medium", statusColors[agent.status])}>{statusLabels[agent.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {agent.currentTask && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium text-foreground">Tarefa Atual:</p>
            <p className="text-sm text-muted-foreground">{agent.currentTask}</p>
          </div>
        )}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Capacidades:</p>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
