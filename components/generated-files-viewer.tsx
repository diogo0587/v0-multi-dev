"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, Download, FileCode } from "lucide-react"

interface GeneratedFile {
  path: string
  content: string
  language: string
}

interface GeneratedFilesViewerProps {
  files: GeneratedFile[]
  description?: string
}

export function GeneratedFilesViewer({ files, description }: GeneratedFilesViewerProps) {
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
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Arquivos Gerados</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={downloadAll} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Baixar Todos
        </Button>
      </div>

      <div className="space-y-3">
        {files.map((file, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm font-medium">{file.path}</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(file.content, file.path)} variant="ghost" size="sm">
                  {copiedFile === file.path ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button onClick={() => downloadFile(file)} variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
              <code>{file.content}</code>
            </pre>
          </Card>
        ))}
      </div>
    </div>
  )
}
