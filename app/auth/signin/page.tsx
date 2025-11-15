"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCredentials = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/admin",
        redirect: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const isDevFallback =
    typeof window !== "undefined" && process.env.NODE_ENV !== "production" &&
    !(process.env.ADMIN_EMAIL) && !(process.env.ADMIN_PASSWORD)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse a área administrativa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevFallback && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p>
                Ambiente de desenvolvimento detectado. Você pode usar:
              </p>
              <p className="mt-1 font-mono">
                Email: admin@local
              </p>
              <p className="font-mono">
                Senha: admin
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Admin)</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleCredentials} disabled={loading}>
            {loading ? "Entrando..." : "Entrar com Credenciais"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">ou</div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("github", { callbackUrl: "/admin" })}
          >
            Entrar com GitHub
          </Button>
          <div className="text-center mt-2">
            <Link href="/" className="text-primary underline text-sm">
              Voltar para a Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}