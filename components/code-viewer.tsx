"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Download } from "lucide-react"

interface GeneratedFile {
  path: string
  content: string
  language: string
}

interface CodeViewerProps {
  files: GeneratedFile[]
}

export function CodeViewer({ files }: CodeViewerProps) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  const copyToClipboard = async (content: string, path: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedFile(path)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.path.split("/").pop() || "file.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    files.forEach((file) => {
      setTimeout(() => downloadFile(file), 100)
    })
  }

  if (files.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum arquivo gerado ainda. Envie uma tarefa para os agentes!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{files.length} arquivo(s) gerado(s)</h3>
        <Button onClick={downloadAll} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Baixar Todos
        </Button>
      </div>

      <Tabs defaultValue={files[0]?.path} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {files.map((file) => (
            <TabsTrigger key={file.path} value={file.path} className="text-xs whitespace-nowrap">
              {file.path.split("/").pop()}
            </TabsTrigger>
          ))}
        </TabsList>

        {files.map((file) => (
          <TabsContent key={file.path} value={file.path} className="mt-4">
            <Card className="overflow-hidden">
              <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
                <code className="text-xs text-muted-foreground">{file.path}</code>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(file.content, file.path)}
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    {copiedFile === file.path ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button onClick={() => downloadFile(file)} variant="ghost" size="sm" className="h-8">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-background">
                <pre className="text-xs overflow-x-auto">
                  <code>{file.content}</code>
                </pre>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
