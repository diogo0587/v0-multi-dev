"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Maximize2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GeneratedFile {
  path: string
  content: string
  language: string
}

interface AppPreviewProps {
  files: GeneratedFile[]
}

export function AppPreview({ files }: AppPreviewProps) {
  const [previewHtml, setPreviewHtml] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [previewType, setPreviewType] = useState<"html" | "react" | "none">("none")

  useEffect(() => {
    generatePreview()
  }, [files])

  const generatePreview = () => {
    setIsLoading(true)

    const hasReactFiles = files.some(
      (f) =>
        f.path.endsWith(".tsx") ||
        f.path.endsWith(".jsx") ||
        f.content.includes("import React") ||
        f.content.includes("from 'react'"),
    )
    const hasHtmlFiles = files.some((f) => f.path.endsWith(".html"))

    if (hasReactFiles) {
      setPreviewType("react")
      setPreviewHtml("")
    } else if (hasHtmlFiles || files.some((f) => f.path.endsWith(".js") || f.path.endsWith(".css"))) {
      setPreviewType("html")
      generateHtmlPreview()
    } else {
      setPreviewType("none")
      setPreviewHtml("")
    }

    setIsLoading(false)
  }

  const generateHtmlPreview = () => {
    const htmlFile = files.find((f) => f.path.endsWith(".html"))
    const cssFiles = files.filter((f) => f.path.endsWith(".css"))
    const jsFiles = files.filter((f) => f.path.endsWith(".js"))

    let html = ""

    if (htmlFile) {
      html = htmlFile.content

      // Inject CSS
      const cssContent = cssFiles.map((f) => `<style>\n${f.content}\n</style>`).join("\n")
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${cssContent}\n</head>`)
      } else {
        html = `<head>${cssContent}</head>${html}`
      }

      // Inject JS
      const jsContent = jsFiles.map((f) => `<script>\n${f.content}\n</script>`).join("\n")
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${jsContent}\n</body>`)
      } else {
        html = `${html}\n${jsContent}`
      }
    } else {
      // Generate complete HTML from scratch
      html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview da Aplicação</title>
  ${cssFiles.map((f) => `<style>\n${f.content}\n</style>`).join("\n")}
</head>
<body>
  <div id="root"></div>
  <div id="app"></div>
  ${jsFiles.map((f) => `<script>\n${f.content}\n</script>`).join("\n")}
</body>
</html>`
    }

    setPreviewHtml(html)
  }

  const handleRefresh = () => {
    generatePreview()
  }

  const handleFullscreen = () => {
    window.open("/preview", "_blank")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={handleFullscreen} variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Tela Cheia
          </Button>
        </div>
      </div>

      {previewType === "react" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta é uma aplicação React/Next.js. Para visualizar, digite no chat:{" "}
            <strong>"Aplique os arquivos gerados ao projeto"</strong> e os arquivos serão criados automaticamente no
            projeto.
          </AlertDescription>
        </Alert>
      )}

      {previewType === "none" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum arquivo HTML, CSS ou JS detectado. Para aplicar os arquivos ao projeto, digite no chat:{" "}
            <strong>"Aplique os arquivos gerados ao projeto"</strong>
          </AlertDescription>
        </Alert>
      )}

      {previewType === "html" && previewHtml && (
        <Card className="overflow-hidden">
          <div className="bg-muted border-b p-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">Preview da Aplicação</span>
          </div>
          <div className="bg-white dark:bg-gray-900">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[600px] border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="App Preview"
            />
          </div>
        </Card>
      )}

      <Tabs defaultValue="structure" className="w-full">
        <TabsList>
          <TabsTrigger value="structure">Estrutura</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>
        <TabsContent value="structure" className="space-y-2">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Arquivos da Aplicação ({files.length})</h4>
            <ul className="space-y-1 text-sm">
              {files.map((file, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <code className="text-xs">{file.path}</code>
                  <span className="text-xs text-muted-foreground">({file.language})</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
        <TabsContent value="info">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Sobre o Preview</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Este preview mostra a aplicação gerada pelos agentes em tempo real.</p>
              <p>
                <strong>Para aplicações HTML/CSS/JS:</strong> O preview é exibido diretamente nesta janela.
              </p>
              <p>
                <strong>Para aplicações React/Next.js:</strong> Digite no chat "Aplique os arquivos gerados ao projeto"
                para criar os arquivos no projeto e visualizar a aplicação completa.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
