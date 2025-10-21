"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Loader2 } from "lucide-react"
import { useChat } from "@/lib/context/chat-context"
import type { TaskPriority } from "@/lib/types/agent"

export function TaskInput() {
  const [taskDescription, setTaskDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const { addTask, addMessage, isProcessing } = useChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDescription.trim() || isProcessing) return

    addMessage({
      agentId: "user",
      agentRole: "orchestrator",
      content: taskDescription,
      type: "info",
    })

    await addTask({
      title: taskDescription.slice(0, 50) + (taskDescription.length > 50 ? "..." : ""),
      description: taskDescription,
      status: "pending",
      priority,
    })

    setTaskDescription("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Descreva a tarefa que deseja atribuir aos agentes..."
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        className="min-h-24 max-h-40 resize-none"
        disabled={isProcessing}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)} disabled={isProcessing}>
          <SelectTrigger className="w-40 flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          className="ml-auto flex-shrink-0 gap-2 min-w-fit"
          disabled={isProcessing || !taskDescription.trim()}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Processando...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar Tarefa</span>
              <span className="sm:hidden">Enviar</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
