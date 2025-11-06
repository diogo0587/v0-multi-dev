"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <SearchX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Página não encontrada</h1>
        <p className="text-muted-foreground">
          A página que você procura pode ter sido removida, teve o nome alterado ou está temporariamente
          indisponível.
        </p>
        <div className="flex justify-center">
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}