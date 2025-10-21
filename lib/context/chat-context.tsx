"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { AgentMessage, Task, AgentRole } from "@/lib/types/agent"

interface GeneratedFile {
  path: string
  content: string
  language: string
}

interface ChatContextType {
  messages: AgentMessage[]
  tasks: Task[]
  isProcessing: boolean
  generatedFiles: GeneratedFile[]
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

  const addMessage = (message: Omit<AgentMessage, "id" | "timestamp">) => {
    const newMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
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
      content: `🤖 Nova tarefa recebida: "${task.title}". Iniciando execução automática...`,
      type: "info",
    })

    const assignedRole = determineAgentRole(task.description)

    setTasks((prev) =>
      prev.map((t) => (t.id === newTask.id ? { ...t, assignedTo: assignedRole, status: "in-progress" } : t)),
    )

    addMessage({
      agentId: "orchestrator-001",
      agentRole: "orchestrator",
      content: `📋 Tarefa atribuída ao agente: ${assignedRole}. Gerando código...`,
      type: "success",
    })

    try {
      const apiKey = localStorage.getItem("gemini_api_key")
      const model = localStorage.getItem("ai_model") || "gemini-2.0-flash-exp"

      const response = await fetch("/api/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskDescription: task.description,
          agentRole: assignedRole,
          apiKey: apiKey || undefined,
          model,
        }),
      })

      const data = await response.json()

      if (data.success && data.files) {
        setGeneratedFiles((prev) => [...prev, ...data.files])

        addMessage({
          agentId: `${assignedRole}-001`,
          agentRole: assignedRole,
          content: `✅ ${data.files.length} arquivo(s) gerado(s) com sucesso!${data.usedGemini ? " (usando Gemini API)" : ""}\n\n${data.description}\n\nArquivos:\n${data.files.map((f: GeneratedFile) => `- ${f.path}`).join("\n")}`,
          type: "success",
        })

        setTasks((prev) =>
          prev.map((t) =>
            t.id === newTask.id ? { ...t, status: "completed", result: `${data.files.length} arquivos gerados` } : t,
          ),
        )
      } else {
        throw new Error(data.error || "Failed to generate files")
      }
    } catch (error) {
      console.error("[v0] Error generating files:", error)

      addMessage({
        agentId: `${assignedRole}-001`,
        agentRole: assignedRole,
        content: `❌ Erro ao gerar arquivos: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
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
      value={{ messages, tasks, isProcessing, generatedFiles, addMessage, addTask, updateTaskStatus }}
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
