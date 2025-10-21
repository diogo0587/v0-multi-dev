"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/lib/context/chat-context"
import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "Em Progresso",
    icon: AlertCircle,
    className: "bg-chart-4 text-background",
  },
  completed: {
    label: "Concluída",
    icon: CheckCircle2,
    className: "bg-chart-2 text-background",
  },
  failed: {
    label: "Falhou",
    icon: XCircle,
    className: "bg-destructive text-destructive-foreground",
  },
}

const priorityConfig = {
  low: { label: "Baixa", className: "border-muted-foreground/50" },
  medium: { label: "Média", className: "border-chart-1" },
  high: { label: "Alta", className: "border-chart-4" },
  critical: { label: "Crítica", className: "border-destructive" },
}

export function TaskList() {
  const { tasks } = useChat()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Tarefas</CardTitle>
        <CardDescription>Todas as tarefas atribuídas aos agentes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {tasks.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">Nenhuma tarefa registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks
                .slice()
                .reverse()
                .map((task) => {
                  const status = task.status || "pending"
                  const priority = task.priority || "medium"
                  const statusInfo = statusConfig[status] || statusConfig.pending
                  const priorityInfo = priorityConfig[priority] || priorityConfig.medium
                  const StatusIcon = statusInfo.icon

                  return (
                    <div
                      key={task.id}
                      className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground">{task.title}</h4>
                        <Badge className={cn("text-xs", statusInfo.className)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", priorityInfo.className)}>
                          {priorityInfo.label}
                        </Badge>
                        {task.assignedTo && (
                          <Badge variant="outline" className="text-xs">
                            {task.assignedTo}
                          </Badge>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {task.createdAt.toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
