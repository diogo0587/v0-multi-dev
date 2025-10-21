export type AgentRole = "orchestrator" | "requirements-analyst" | "frontend-dev" | "backend-dev" | "devops"

export type AgentStatus = "idle" | "working" | "completed" | "error"

export type TaskPriority = "low" | "medium" | "high" | "critical"

export interface Agent {
  id: string
  role: AgentRole
  name: string
  description: string
  status: AgentStatus
  currentTask?: string
  capabilities: string[]
  avatar: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo?: AgentRole
  status: "pending" | "in-progress" | "completed" | "failed"
  priority: TaskPriority
  createdAt: Date
  updatedAt: Date
  result?: string
  dependencies?: string[]
}

export interface AgentMessage {
  id: string
  agentId: string
  agentRole: AgentRole
  content: string
  timestamp: Date
  type: "info" | "success" | "warning" | "error"
}

export interface AgentCommunication {
  from: AgentRole
  to: AgentRole
  message: string
  taskId?: string
  timestamp: Date
}
