"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Maximize2 } from "lucide-react"

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

  useEffect(() => {
    generatePreview()
  }, [files])

  const generatePreview = () => {
    setIsLoading(true)

    // Find HTML, CSS, and JS files
    const htmlFile = files.find((f) => f.path.endsWith(".html"))
    const cssFiles = files.filter((f) => f.path.endsWith(".css"))
    const jsFiles = files.filter((f) => f.path.endsWith(".js") || f.path.endsWith(".jsx"))

    if (!htmlFile) {
      // Generate a basic HTML structure if none exists
      const html = generateBasicHtml(files)
      setPreviewHtml(html)
    } else {
      // Inject CSS and JS into HTML
      let html = htmlFile.content

      // Add CSS
      const cssContent = cssFiles.map((f) => `<style>${f.content}</style>`).join("\n")
      html = html.replace("</head>", `${cssContent}</head>`)

      // Add JS
      const jsContent = jsFiles.map((f) => `<script>${f.content}</script>`).join("\n")
      html = html.replace("</body>", `${jsContent}</body>`)

      setPreviewHtml(html)
    }

    setIsLoading(false)
  }

  const generateBasicHtml = (files: GeneratedFile[]) => {
    const cssFiles = files.filter((f) => f.path.endsWith(".css"))
    const jsFiles = files.filter((f) => f.path.endsWith(".js"))

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview da Aplicação</title>
  ${cssFiles.map((f) => `<style>${f.content}</style>`).join("\n")}
</head>
<body>
  <div id="root"></div>
  ${jsFiles.map((f) => `<script>${f.content}</script>`).join("\n")}
</body>
</html>
    `
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
            sandbox="allow-scripts allow-same-origin"
            title="App Preview"
          />
        </div>
      </Card>

      <Tabs defaultValue="structure" className="w-full">
        <TabsList>
          <TabsTrigger value="structure">Estrutura</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>
        <TabsContent value="structure" className="space-y-2">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Arquivos da Aplicação</h4>
            <ul className="space-y-1 text-sm">
              {files.map((file, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <code className="text-xs">{file.path}</code>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
        <TabsContent value="info">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Sobre o Preview</h4>
            <p className="text-sm text-muted-foreground">
              Este preview mostra a aplicação gerada pelos agentes em tempo real. Você pode interagir com a aplicação
              diretamente nesta janela ou abrir em tela cheia para uma melhor experiência.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
