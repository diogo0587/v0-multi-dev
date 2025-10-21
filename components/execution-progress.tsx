"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"

interface ExecutionStep {
  step: number
  description: string
  status: "pending" | "in-progress" | "completed" | "failed"
  output?: string
}

interface ExecutionProgressProps {
  steps: ExecutionStep[]
  agentRole: string
}

export function ExecutionProgress({ steps, agentRole }: ExecutionProgressProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <h3 className="font-semibold">Execução em Andamento - {agentRole}</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.step} className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              {step.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {step.status === "in-progress" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
              {step.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
              {step.status === "pending" && <Circle className="h-5 w-5 text-muted-foreground" />}
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{step.description}</p>
              {step.output && (
                <pre className="text-xs text-muted-foreground bg-muted p-2 rounded whitespace-pre-wrap">
                  {step.output}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
