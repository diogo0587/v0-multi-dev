"use client"

import { useState, useEffect } from "react"
import { OrchestratorAgent } from "@/lib/agents/orchestrator"
import { RequirementsAnalystAgent } from "@/lib/agents/requirements-analyst"
import { FrontendDevAgent } from "@/lib/agents/frontend-dev"
import { BackendDevAgent } from "@/lib/agents/backend-dev"
import { DevOpsAgent } from "@/lib/agents/devops"
import type { Agent } from "@/lib/types/agent"

export function useAgentSystem() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [orchestrator, setOrchestrator] = useState<OrchestratorAgent | null>(null)

  useEffect(() => {
    const orch = new OrchestratorAgent()
    const analyst = new RequirementsAnalystAgent()
    const frontendDev = new FrontendDevAgent()
    const backendDev = new BackendDevAgent()
    const devops = new DevOpsAgent()

    setOrchestrator(orch)
    setAgents([orch.getAgent(), analyst.getAgent(), frontendDev.getAgent(), backendDev.getAgent(), devops.getAgent()])
  }, [])

  return { agents, orchestrator }
}
