"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Code, Play, Key, CheckCircle2, XCircle, ArrowLeft, ExternalLink, Rocket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/lib/context/settings-context"
import { useChat } from "@/lib/context/chat-context"
import { GeneratedFilesViewer } from "@/components/generated-files-viewer"
import { AppPreview } from "@/components/app-preview"
import Link from "next/link"

export default function AdminPage() {
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const { toast } = useToast()
  const { apiKey, setApiKey, clearApiKey, model, setModel, temperature, setTemperature } = useSettings()
  const { generatedFiles, activities } = useChat()

  useEffect(() => {
    if (apiKey) {
      setApiKeyInput(apiKey)
      setIsApiKeyValid(true)
    }
  }, [apiKey])

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma API key válida",
        variant: "destructive",
      })
      return
    }

    setApiKey(apiKeyInput)
    setIsApiKeyValid(true)

    toast({
      title: "Sucesso",
      description: "API key salva com sucesso!",
    })
  }

  const handleTestApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma API key",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKeyInput}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Hello" }] }],
          }),
        },
      )

      if (response.ok) {
        setIsApiKeyValid(true)
        toast({
          title: "Sucesso",
          description: "API key válida!",
        })
      } else {
        setIsApiKeyValid(false)
        toast({
          title: "Erro",
          description: "API key inválida",
          variant: "destructive",
        })
      }
    } catch (error) {
      setIsApiKeyValid(false)
      toast({
        title: "Erro",
        description: "Erro ao testar API key",
        variant: "destructive",
      })
    }
  }

  const handleClearApiKey = () => {
    clearApiKey()
    setApiKeyInput("")
    setIsApiKeyValid(null)
    toast({
      title: "API key removida",
      description: "A API key foi removida do sistema",
    })
  }

  const handleDeploy = async () => {
    try {
      setIsDeploying(true)
      const res = await fetch("/api/deploy", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao acionar deploy")
      }
      toast({
        title: "Deploy acionado",
        description: data.message || "Vercel Deploy Hook executado",
      })
    } catch (e) {
      toast({
        title: "Erro no deploy",
        description: e instanceof Error ? e.message : "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Área Admin</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Configure e gerencie seu sistema multiagente de IA
            </p>
          </div>
        </div>

        <Tabs defaultValue="settings" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Play className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Code className="h-4 w-4" />
              Arquivos
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Key className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configuração da API Key
                </CardTitle>
                <CardDescription>
                  Configure sua API key do Google Gemini para habilitar a geração automática de código
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Google Gemini API Key</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="AIza..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="font-mono"
                    />
                    {isApiKeyValid !== null && (
                      <Badge variant={isApiKeyValid ? "default" : "destructive"} className="gap-1">
                        {isApiKeyValid ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Válida
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inválida
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Obtenha sua API key em{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleSaveApiKey}>Salvar API Key</Button>
                  <Button onClick={handleTestApiKey} variant="outline">
                    Testar Conexão
                  </Button>
                  {apiKey && (
                    <Button onClick={handleClearApiKey} variant="destructive">
                      Remover API Key
                    </Button>
                  )}
                </div>

                {apiKey && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      ✓ API key configurada e pronta para uso
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Personalize o comportamento dos agentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo de IA</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gemini-2.0-flash-exp"
                  />
                  <p className="text-sm text-muted-foreground">
                    Modelos disponíveis: gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura (Criatividade): {temperature}</Label>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    0 = Mais preciso e determinístico | 2 = Mais criativo e variado
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preview da Aplicação</span>
                  {generatedFiles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/preview" target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir em Nova Aba
                        </Link>
                      </Button>
                      <Button variant="default" size="sm" onClick={handleDeploy} disabled={isDeploying}>
                        <Rocket className={`h-4 w-4 mr-2 ${isDeploying ? "animate-pulse" : ""}`} />
                        {isDeploying ? "Acionando..." : "Deploy"}
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>Visualize e execute a aplicação gerada pelos agentes</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedFiles.length > 0 ? (
                  <AppPreview files={generatedFiles} />
                ) : (
                  <div className="rounded-lg border bg-muted/50 p-8 text-center">
                    <Play className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      Nenhuma aplicação gerada ainda. Atribua uma tarefa aos agentes para começar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Gerados</CardTitle>
                <CardDescription>Visualize e gerencie os arquivos criados pelos agentes</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedFiles.length > 0 ? (
                  <GeneratedFilesViewer files={generatedFiles} />
                ) : (
                  <div className="rounded-lg border bg-muted/50 p-8 text-center">
                    <Code className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Nenhum arquivo gerado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Execução</CardTitle>
                <CardDescription>Acompanhe as atividades dos agentes em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {activities.map((activity, index) => (
                      <div key={index} className="rounded-lg border bg-card p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{activity.agent}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{activity.action}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/50 p-8 text-center">
                    <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Nenhum log disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
