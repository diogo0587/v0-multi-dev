"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/lib/context/chat-context"
import { cn } from "@/lib/utils"

const typeConfig = {
  info: {
    color: "bg-muted",
    dotColor: "bg-chart-1",
  },
  success: {
    color: "bg-chart-2/10",
    dotColor: "bg-chart-2",
  },
  warning: {
    color: "bg-chart-4/10",
    dotColor: "bg-chart-4",
  },
  error: {
    color: "bg-destructive/10",
    dotColor: "bg-destructive",
  },
}

const roleNames = {
  orchestrator: "Orquestrador",
  "requirements-analyst": "Analista",
  "frontend-dev": "Frontend Dev",
  "backend-dev": "Backend Dev",
  devops: "DevOps",
}

export function ActivityTimeline() {
  const { messages } = useChat()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Atividades</CardTitle>
        <CardDescription>Histórico completo de comunicações dos agentes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
            </div>
          ) : (
            <div className="relative space-y-4 pl-6">
              {/* Timeline line */}
              <div className="absolute left-2 top-2 h-[calc(100%-1rem)] w-px bg-border" />

              {messages.map((message, index) => (
                <div key={message.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-background",
                      typeConfig[message.type].dotColor,
                    )}
                  />

                  {/* Message content */}
                  <div className={cn("rounded-lg border border-border p-3", typeConfig[message.type].color)}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{roleNames[message.agentRole]}</span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
