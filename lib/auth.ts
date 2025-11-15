import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const DEV_FALLBACK = {
  email: "admin@local",
  password: "admin",
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [
    // GitHub OAuth (opcional)
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
          }),
        ]
      : []),
    // Credenciais (Admin via variáveis de ambiente) + fallback dev
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").toString().toLowerCase().trim()
        const password = (credentials?.password || "").toString()

        const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim()
        const adminPassword = process.env.ADMIN_PASSWORD || ""

        // Produção: requer ADMIN_EMAIL/ADMIN_PASSWORD
        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          const user = await prisma.user.upsert({
            where: { email },
            update: { role: "ADMIN", name: "Admin" },
            create: { email, name: "Admin", role: "ADMIN" },
          })
          return { id: user.id, email: user.email, name: user.name || "Admin", image: user.image }
        }

        // Desenvolvimento: fallback se não houver env definido
        if (process.env.NODE_ENV !== "production" && !adminEmail && !adminPassword) {
          if (email === DEV_FALLBACK.email && password === DEV_FALLBACK.password) {
            const user = await prisma.user.upsert({
              where: { email },
              update: { role: "ADMIN", name: "Admin (Dev)" },
              create: { email, name: "Admin (Dev)", role: "ADMIN" },
            })
            return { id: user.id, email: user.email, name: user.name || "Admin (Dev)", image: user.image }
          }
        }

        // Caso contrário, negar
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id || token.sub
        token.role = (user as any).role || token.role || "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.uid
        ;(session.user as any).role = (token as any).role || "USER"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
}