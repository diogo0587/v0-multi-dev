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
  const [isApplying, setIsApplying] = useState(false)
  const { addTask, addMessage, isProcessing, generatedFiles } = useChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = taskDescription.trim()
    if (!text || isProcessing || isApplying) return

    addMessage({
      agentId: "user",
      agentRole: "orchestrator",
      content: text,
      type: "info",
    })

    const lower = text.toLowerCase()
    const isApplyCmd =
      lower.includes("aplique os arquivos") ||
      lower.includes("aplicar os arquivos") ||
      lower.includes("aplique os arquivos gerados") ||
      lower.includes("aplicar arquivos gerados") ||
      lower.includes("aplicar ao projeto") ||
      lower.includes("aplique ao projeto")

    if (isApplyCmd) {
      if (generatedFiles.length === 0) {
        addMessage({
          agentId: "orchestrator-001",
          agentRole: "orchestrator",
          content: "⚠️ Nenhum arquivo gerado para aplicar.",
          type: "warning",
        })
        setTaskDescription("")
        return
      }

      try {
        setIsApplying(true)
        addMessage({
          agentId: "orchestrator-001",
          agentRole: "orchestrator",
          content: "🚀 Aplicando arquivos gerados ao projeto...",
          type: "info",
        })

        const res = await fetch("/api/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: generatedFiles, commitMessage: "feat(ai): aplicar arquivos gerados" }),
        })
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Falha ao aplicar arquivos")
        }

        if (data.mode === "github" && data.prUrl) {
          addMessage({
            agentId: "orchestrator-001",
            agentRole: "orchestrator",
            content: `✅ Pull Request criado com sucesso: ${data.prUrl}`,
            type: "success",
          })
        } else {
          addMessage({
            agentId: "orchestrator-001",
            agentRole: "orchestrator",
            content: "✅ Arquivos aplicados no filesystem do servidor (dev).",
            type: "success",
          })
        }
      } catch (err) {
        addMessage({
          agentId: "orchestrator-001",
          agentRole: "orchestrator",
          content: `❌ Erro ao aplicar arquivos: ${err instanceof Error ? err.message : "desconhecido"}`,
          type: "error",
        })
      } finally {
        setIsApplying(false)
        setTaskDescription("")
      }
      return
    }

    await addTask({
      title: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
      description: text,
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
        disabled={isProcessing || isApplying}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value as TaskPriority)}
          disabled={isProcessing || isApplying}
        >
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
          disabled={isProcessing || isApplying || !taskDescription.trim()}
        >
          {isProcessing || isApplying ? (
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
