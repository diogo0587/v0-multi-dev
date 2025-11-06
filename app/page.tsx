"use client"

import { useState, useEffect } from "react"
import { AgentCard } from "@/components/agent-card"
import { StatsCard } from "@/components/stats-card"
import { ChatPanel } from "@/components/chat-panel"
import { LogsPanel } from "@/components/logs-panel"
import { AdminLink } from "@/components/admin-link"
import { useAgentSystem } from "@/lib/hooks/use-agent-system"
import { Users, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { MaintenancePanel } from "@/components/maintenance-panel"
import { useChat } from "@/lib/context/chat-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardPage() {
  const { agents } = useAgentSystem()
  const { tasks } = useChat()
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    completedTasks: 0,
    pendingTasks: 0,
  })

  useEffect(() => {
    const activeCount = agents.filter((a) => a.status === "working").length
    const completed = tasks.filter((t) => t.status === "completed").length
    const pending = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length

    setStats({
      totalAgents: agents.length,
      activeAgents: activeCount,
      completedTasks: completed,
      pendingTasks: pending,
    })
  }, [agents, tasks])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Multiagente IA</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Sistema de squad de IAs totalmente automatizado
            </p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AdminLink />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Agentes"
            value={stats.totalAgents}
            description="Agentes disponíveis no sistema"
            icon={Users}
          />
          <StatsCard
            title="Agentes Ativos"
            value={stats.activeAgents}
            description="Trabalhando agora"
            icon={Clock}
            trend={{ value: 20, isPositive: true }}
          />
          <StatsCard
            title="Tarefas Concluídas"
            value={stats.completedTasks}
            description="Total concluído"
            icon={CheckCircle2}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Tarefas Pendentes"
            value={stats.pendingTasks}
            description="Aguardando processamento"
            icon={AlertCircle}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Chat Panel */}
          <ChatPanel />

          {/* Logs Panel */}
          <LogsPanel />
        </div>

        {/* Maintenance Panel */}
        <MaintenancePanel />

        {/* Agents Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">Squad de Agentes</h2>
          </div>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
