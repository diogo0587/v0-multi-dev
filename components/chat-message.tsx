import { cn } from "@/lib/utils"
import type { AgentMessage } from "@/lib/types/agent"

interface ChatMessageProps {
  message: AgentMessage
}

const typeStyles = {
  info: "bg-muted border-border",
  success: "bg-chart-2/10 border-chart-2",
  warning: "bg-chart-4/10 border-chart-4",
  error: "bg-destructive/10 border-destructive",
}

const roleNames = {
  orchestrator: "Orquestrador",
  "requirements-analyst": "Analista",
  "frontend-dev": "Frontend Dev",
  "backend-dev": "Backend Dev",
  devops: "DevOps",
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={cn("rounded-lg border-l-4 p-4", typeStyles[message.type])}>
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
  )
}
