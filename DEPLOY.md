# Guia de Deploy e Automação

## 1) Deploy Automático (Vercel Deploy Hook)

- Crie um Deploy Hook no projeto Vercel (Project Settings → Git → Deploy Hooks).
- Adicione o valor como secret no GitHub (`VERCEL_DEPLOY_HOOK_URL`) ou em `.env.local`.

Você poderá:
- Disparar deploy pelo botão “Deploy” (Admin > Preview).
- Disparar deploy via chat: “fazer deploy”, “publicar”, etc.
- Disparar deploy automaticamente no push para `main` (workflow `.github/workflows/deploy.yml` usa o secret).

## 2) PR Automático no GitHub

Para aplicar arquivos gerados criando um Pull Request automaticamente:

- Adicione secrets no GitHub:
  - `GITHUB_TOKEN` (token com permissão `repo`)
  - `GITHUB_REPO` (formato `owner/repo`)
  - Opcional: `GITHUB_BASE_BRANCH` (padrão `main`)

Ao usar “Aplicar ao Projeto”:
- Um PR é criado com label `ai-generated`.
- Workflow `.github/workflows/auto-merge.yml` fará auto-merge (se permitido nas configs do repo).
- Workflow `.github/workflows/ci.yml` roda type-check e build.

## 3) Modo Turbo (Gerar → Aplicar → Deploy)

- Ative `NEXT_PUBLIC_AI_TURBO=1` (em `.env.local` e/ou salve no localStorage).
- Ao gerar arquivos, o sistema aplica e aciona deploy automaticamente.

## 4) Variáveis de Ambiente (Resumo)

No Vercel (Project Settings → Environment Variables) ou `.env.local`:

```
# IA
GEMINI_API_KEY=...

# GitHub (PR automático)
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
GITHUB_BASE_BRANCH=main

# Deploy Hook
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...

# Turbo
NEXT_PUBLIC_AI_TURBO=0
```

## 5) Após o Deploy

- Acesse a URL fornecida pelo Vercel
- Configure sua API key no Admin (/admin), caso não tenha configurado via ambiente
- Interaja com o chatbot para gerar, aplicar e publicar sua aplicação

## 6) Recursos da Aplicação

- ✅ Geração de código por múltiplos agentes (IA)
- ✅ Chat de orquestração
- ✅ Preview de aplicações
- ✅ Aplicação automática (FS/PR)
- ✅ Deploy via Hook
- ✅ Modo Turbo
- ✅ CI (type-check + build)
- ✅ Auto-merge opcional
- ✅ Tema escuro/claro

## Suporte

Se encontrar problemas:
1. Verifique os logs de build no Vercel
2. Confirme as variáveis de ambiente/secrets
3. Confira a aba Actions do GitHub (CI/auto-merge/deploy)
4. Abra um ticket em vercel.com/help
