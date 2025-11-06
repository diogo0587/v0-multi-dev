"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, Download, FileCode, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [isApplying, setIsApplying] = useState(false)
  const { toast } = useToast()

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

  const handleApply = async () => {
    if (!files.length || isApplying) return
    setIsApplying(true)
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, commitMessage: "feat(ai): aplicar arquivos gerados" }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao aplicar arquivos")
      }
      if (data.mode === "github" && data.prUrl) {
        toast({
          title: "PR criado no GitHub",
          description: `Arquivos enviados e Pull Request aberto: ${data.prUrl}`,
        })
        window.open(data.prUrl, "_blank")
      } else {
        toast({
          title: "Arquivos aplicados",
          description: "Os arquivos foram gravados no filesystem do servidor (dev).",
        })
      }
    } catch (e) {
      toast({
        title: "Erro ao aplicar arquivos",
        description: e instanceof Error ? e.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-lg">Arquivos Gerados</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApply} variant="default" size="sm" disabled={isApplying}>
            <Sparkles className={`h-4 w-4 mr-2 ${isApplying ? "animate-pulse" : ""}`} />
            {isApplying ? "Aplicando..." : "Aplicar ao Projeto"}
          </Button>
          <Button onClick={downloadAll} variant="outline" size="sm" disabled={isApplying}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Todos
          </Button>
        </div>
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
            <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs max-h-[300px]">
              <code>{file.content}</code>
            </pre>
          </Card>
        ))}
      </div>
    </div>
  )
}
