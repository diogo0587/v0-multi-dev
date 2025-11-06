"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { AgentMessage, Task, AgentRole } from "@/lib/types/agent"

interface GeneratedFile {
  path: string
  content: string
  language: string
}

interface Activity {
  agent: string
  action: string
  timestamp: Date
}

interface ChatContextType {
  messages: AgentMessage[]
  tasks: Task[]
  isProcessing: boolean
  generatedFiles: GeneratedFile[]
  activities: Activity[]
  addMessage: (message: Omit<AgentMessage, "id" | "timestamp">) => void
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTaskStatus: (taskId: string, status: Task["status"]) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  // Persistência simples no localStorage
  useEffect(() => {
    try {
      const m = localStorage.getItem("chat_messages")
      const t = localStorage.getItem("chat_tasks")
      const f = localStorage.getItem("chat_files")
      const a = localStorage.getItem("chat_activities")
      if (m) {
        const parsed = JSON.parse(m) as AgentMessage[]
        setMessages(parsed.map((msg) => ({ ...msg, timestamp: new Date(msg.timestamp) })))
      }
      if (t) {
        const parsed = JSON.parse(t) as Task[]
        setTasks(
          parsed.map((task) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          })),
        )
      }
      if (f) {
        setGeneratedFiles(JSON.parse(f) as GeneratedFile[])
      }
      if (a) {
        const parsed = JSON.parse(a) as Activity[]
        setActivities(parsed.map((act) => ({ ...act, timestamp: new Date(act.timestamp) })))
      }
    } catch {
      // ignora erros de parse
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("chat_messages", JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => {
    try {
      localStorage.setItem("chat_tasks", JSON.stringify(tasks))
    } catch {}
  }, [tasks])

  useEffect(() => {
    try {
      localStorage.setItem("chat_files", JSON.stringify(generatedFiles))
    } catch {}
  }, [generatedFiles])

  useEffect(() => {
    try {
      localStorage.setItem("chat_activities", JSON.stringify(activities))
    } catch {}
  }, [activities])

  const addMessage = (message: Omit<AgentMessage, "id" | "timestamp">) => {
    const newMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])

    setActivities((prev) => [
      ...prev,
      {
        agent: message.agentRole,
        action: message.content,
        timestamp: new Date(),
      },
    ])
  }

  const determineAgentRole = (description: string): AgentRole => {
    const lowerDesc = description.toLowerCase()

    if (
      lowerDesc.includes("interface") ||
      lowerDesc.includes("ui") ||
      lowerDesc.includes("frontend") ||
      lowerDesc.includes("componente") ||
      lowerDesc.includes("página")
    ) {
      return "frontend-dev"
    } else if (lowerDesc.includes("api") || lowerDesc.includes("database") || lowerDesc.includes("backend")) {
      return "backend-dev"
    } else if (lowerDesc.includes("deploy") || lowerDesc.includes("ci/cd") || lowerDesc.includes("infraestrutura")) {
      return "devops"
    } else if (
      lowerDesc.includes("requisitos") ||
      lowerDesc.includes("análise") ||
      lowerDesc.includes("documentação")
    ) {
      return "requirements-analyst"
    }

    return "orchestrator"
  }

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    setIsProcessing(true)

    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks((prev) => [...prev, newTask])

    addMessage({
      agentId: "orchestrator-001",
      agentRole: "orchestrator",
      content: `🎯 Orquestrador: Analisando tarefa "${task.title}" e coordenando equipe de agentes...`,
      type: "info",
    })

    try {
      const apiKey = localStorage.getItem("gemini_api_key")
      const model = localStorage.getItem("ai_model") || "gemini-2.0-flash-exp"
      const temperature = Number.parseFloat(localStorage.getItem("ai_temperature") || "0.7")

      const response = await fetch("/api/agent/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: task.description,
          apiKey: apiKey || undefined,
          model,
          temperature,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.steps && Array.isArray(data.steps)) {
          for (const step of data.steps) {
            const agentEmoji =
              step.agent === "Orquestrador"
                ? "🎯"
                : step.agent === "Analista de Requisitos"
                  ? "📋"
                  : step.agent === "Dev Frontend"
                    ? "🎨"
                    : step.agent === "Dev Backend"
                      ? "⚙️"
                      : "🤖"

            addMessage({
              agentId: `${step.agent}-001`,
              agentRole: "orchestrator",
              content: `${agentEmoji} ${step.agent}: ${step.summary || "Trabalho concluído"}`,
              type: "info",
            })
          }
        }

        if (data.files && data.files.length > 0) {
          setGeneratedFiles((prev) => [...prev, ...data.files])

          addMessage({
            agentId: "orchestrator-001",
            agentRole: "orchestrator",
            content: `✅ Equipe concluiu o trabalho! ${data.files.length} arquivo(s) gerado(s):\n${data.files.map((f: GeneratedFile) => `- ${f.path}`).join("\n")}\n\n💡 Use os botões abaixo para copiar ou baixar os arquivos.`,
            type: "success",
          })

          setTasks((prev) =>
            prev.map((t) =>
              t.id === newTask.id
                ? { ...t, status: "completed", result: `${data.files.length} arquivos gerados pela equipe` }
                : t,
            ),
          )
        } else {
          addMessage({
            agentId: "orchestrator-001",
            agentRole: "orchestrator",
            content: `✅ ${data.message || "Análise concluída pela equipe!"}`,
            type: "success",
          })

          setTasks((prev) =>
            prev.map((t) => (t.id === newTask.id ? { ...t, status: "completed", result: "Análise concluída" } : t)),
          )
        }
      } else {
        throw new Error(data.error || "Failed to orchestrate agents")
      }
    } catch (error) {
      console.error("[v0] Error in orchestration:", error)

      addMessage({
        agentId: "orchestrator-001",
        agentRole: "orchestrator",
        content: `❌ Erro na orquestração: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        type: "error",
      })

      setTasks((prev) => prev.map((t) => (t.id === newTask.id ? { ...t, status: "failed" } : t)))
    } finally {
      setIsProcessing(false)
    }
  }

  const updateTaskStatus = (taskId: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status, updatedAt: new Date() } : task)))
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        tasks,
        isProcessing,
        generatedFiles,
        activities,
        addMessage,
        addTask,
        updateTaskStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}
