"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat-message"
import { TaskInput } from "@/components/task-input"
import { GeneratedFilesViewer } from "@/components/generated-files-viewer"
import { useChat } from "@/lib/context/chat-context"

export function ChatPanel() {
  const { messages, generatedFiles } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <CardTitle>Central de Comandos</CardTitle>
        <CardDescription>Atribua tarefas e acompanhe o progresso dos agentes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma mensagem ainda. Comece atribuindo uma tarefa aos agentes.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {generatedFiles.length > 0 && (
                  <div className="mt-6">
                    <GeneratedFilesViewer files={generatedFiles} />
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
        <TaskInput />
      </CardContent>
    </Card>
  )
}
