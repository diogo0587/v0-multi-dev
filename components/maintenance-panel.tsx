"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChat } from "@/lib/context/chat-context"
import { Wrench, Send } from "lucide-react"

export function MaintenancePanel() {
  const [maintenanceRequest, setMaintenanceRequest] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { addTask, generatedFiles } = useChat()

  const handleMaintenance = async () => {
    if (!maintenanceRequest.trim() || generatedFiles.length === 0) return

    setIsProcessing(true)

    // Add context about existing files to the maintenance request
    const contextualRequest = `MANUTENÇÃO DE CÓDIGO EXISTENTE:

Arquivos atuais:
${generatedFiles.map((f) => `- ${f.path}`).join("\n")}

Solicitação de manutenção:
${maintenanceRequest}

Por favor, analise os arquivos existentes e faça as modificações solicitadas mantendo a estrutura e funcionalidades existentes.`

    await addTask(contextualRequest, "high")
    setMaintenanceRequest("")
    setIsProcessing(false)
  }

  if (generatedFiles.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Manutenção de Código
        </CardTitle>
        <CardDescription>Solicite modificações, melhorias ou correções no código gerado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Ex: Adicione validação de formulário, mude a cor do botão para azul, adicione animações..."
          value={maintenanceRequest}
          onChange={(e) => setMaintenanceRequest(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <Button onClick={handleMaintenance} disabled={!maintenanceRequest.trim() || isProcessing} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          {isProcessing ? "Processando..." : "Solicitar Manutenção"}
        </Button>
      </CardContent>
    </Card>
  )
}
