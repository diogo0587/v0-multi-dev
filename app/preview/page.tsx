"use client"

import { useEffect, useState } from "react"
import { useChat } from "@/lib/context/chat-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PreviewPage() {
  const { generatedFiles } = useChat()
  const [previewHtml, setPreviewHtml] = useState("")

  useEffect(() => {
    if (generatedFiles.length > 0) {
      generatePreview()
    }
  }, [generatedFiles])

  const generatePreview = () => {
    const htmlFile = generatedFiles.find((f) => f.path.endsWith(".html"))
    const cssFiles = generatedFiles.filter((f) => f.path.endsWith(".css"))
    const jsFiles = generatedFiles.filter((f) => f.path.endsWith(".js") || f.path.endsWith(".jsx"))

    if (!htmlFile) {
      const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplicação Gerada</title>
  ${cssFiles.map((f) => `<style>${f.content}</style>`).join("\n")}
</head>
<body>
  <div id="root"></div>
  ${jsFiles.map((f) => `<script>${f.content}</script>`).join("\n")}
</body>
</html>
      `
      setPreviewHtml(html)
    } else {
      let html = htmlFile.content
      const cssContent = cssFiles.map((f) => `<style>${f.content}</style>`).join("\n")
      html = html.replace("</head>", `${cssContent}</head>`)
      const jsContent = jsFiles.map((f) => `<script>${f.content}</script>`).join("\n")
      html = html.replace("</body>", `${jsContent}</body>`)
      setPreviewHtml(html)
    }
  }

  if (generatedFiles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Nenhuma aplicação disponível</h1>
          <p className="text-muted-foreground">Gere uma aplicação primeiro usando os agentes</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 left-4 z-50">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
      <iframe
        srcDoc={previewHtml}
        className="w-full h-screen border-0"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="App Preview Fullscreen"
      />
    </div>
  )
}
