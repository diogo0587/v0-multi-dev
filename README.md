# Multiagente IA - Sistema de Desenvolvimento Automatizado

Sistema completo de desenvolvimento automatizado usando múltiplos agentes de IA que trabalham em equipe para criar aplicações web. Interaja via chatbot e deixe a IA orquestrar requisitos, frontend, backend e DevOps — inclusive aplicar arquivos, abrir PR e disparar deploy.

## Visão Geral

Agentes do time:

- **Orquestrador**: Coordena a equipe e distribui tarefas
- **Analista de Requisitos**: Analisa e documenta requisitos
- **Desenvolvedor Frontend**: Cria interfaces e componentes React/Next.js
- **Desenvolvedor Backend**: Implementa APIs e lógica de servidor
- **DevOps**: Configura CI/CD e deploy

## Funcionalidades

- Geração automática de código por múltiplos agentes de IA
- Chatbot para orquestrar tarefas (comandos em linguagem natural)
- Preview em tempo real do app gerado
- Aplicação automática dos arquivos:
  - Filesystem (dev) ou Pull Request no GitHub
- Deploy automático via Vercel Deploy Hook
- Modo Turbo: gerar → aplicar → deployar automaticamente (configurável)
- Área Admin para configuração (API key, modelo e temperatura)
- Persistência local de mensagens/tarefas/arquivos/atividades
- CI (GitHub Actions) com type-check e build
- Auto-merge de PRs “ai-generated” (opcional)
- Download ZIP de todos os arquivos gerados
- Tema escuro/claro

## Requisitos

- Node.js 18+ ou 20+
- npm ou pnpm
- Conta Vercel (para deploy)
- Repositório GitHub (para PR automático)

## Instalação

### Desenvolvimento Local

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Executar em modo desenvolvimento
npm run dev

# Abrir http://localhost:3000
```

### Build de Produção

```bash
# Criar build otimizado
npm run build

# Executar build de produção
npm start
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# IA (opcional — também pode ser configurado via Admin)
GEMINI_API_KEY=sua_api_key_aqui

# Automação de PR no GitHub (opcional)
GITHUB_TOKEN=ghp_xxx_com_permissao_repo
GITHUB_REPO=owner/nome-repo
GITHUB_BASE_BRANCH=main

# Deploy automático (opcional)
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/prj_xxx/xxxx

# Modo Turbo (opcional - lado cliente; setado no localStorage também)
NEXT_PUBLIC_AI_TURBO=0
```

Observação:
- Se GITHUB_TOKEN + GITHUB_REPO estiverem configurados, “Aplicar ao Projeto” criará um PR automaticamente com label `ai-generated`.
- O workflow `.github/workflows/auto-merge.yml` fará auto-merge para PRs com label `ai-generated` (caso o repositório permita).

### Configuração via Interface

1. Acesse a área Admin
2. Em “Configurações”, informe sua API key do Gemini, modelo e temperatura
3. As configurações ficam salvas no localStorage

## Deploy na Vercel

### Deploy automático por Hook

- Configure `VERCEL_DEPLOY_HOOK_URL` (Environment Secret ou .env)
- Clique no botão “Deploy” (Admin > Preview) ou peça no chat:
  - “fazer deploy”, “publicar”, “deploy”, “enviar para produção”

### Deploy via GitHub

1. Push no GitHub
2. O workflow de CI roda (type-check e build)
3. O workflow `Deploy (Vercel Hook)` dispara para a branch principal (se `VERCEL_DEPLOY_HOOK_URL` estiver em Secrets)

### CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## Uso

### Criar uma Aplicação

- No dashboard, escreva no chat o que deseja (ex.: “Crie um dashboard de vendas com gráfico e tabela com filtros”).
- Acompanhe as etapas e arquivos gerados.
- Baixe os arquivos individualmente, todos, ou como ZIP.

### Aplicar Arquivos ao Projeto

- Botão “Aplicar ao Projeto” (Admin > Arquivos) ou comando no chat:
  - “Aplique os arquivos gerados ao projeto”, “aplicar ao projeto” etc.
- Se GitHub estiver configurado, um PR é aberto automaticamente.
- Sem GitHub no ambiente local, os arquivos são gravados diretamente no filesystem do servidor (dev).

### Modo Turbo (opcional)

- Ative `NEXT_PUBLIC_AI_TURBO=1` (via .env ou salvando no localStorage).
- Ao gerar arquivos, o sistema automaticamente:
  1. Aplica os arquivos (PR no GitHub ou filesystem)
  2. Dispara o deploy

### Comandos Úteis (Chat)

- “Aplique os arquivos gerados ao projeto”
- “Fazer deploy”, “publicar”, “enviar para produção”
- “Corrija/ajuste/adicione” (para manutenção guiada)

## Estrutura do Projeto

```
multiagente-ia/
├── app/
│   ├── page.tsx           # Dashboard
│   ├── admin/             # Área administrativa (Preview/Arquivos/Logs)
│   ├── preview/           # Preview fullscreen
│   └── api/               # API routes
│       ├── agent/         # IA: orchestrate/generate/process/execute
│       ├── apply/         # Aplica arquivos (PR ou filesystem)
│       ├── deploy/        # Dispara deploy (Vercel Hook)
│       └── archive/       # Gera ZIP dos arquivos
├── components/            # UI/Chat/Visualizadores
├── lib/                   # Agents, contextos e tipos
└── .github/workflows/     # CI, auto-merge e deploy hook
```

## Tecnologias

- **Next.js 15**, **React 19**, **TypeScript**
- **Tailwind CSS v4**, **shadcn/ui**
- **Vercel AI SDK**
- **GitHub Actions** (CI, auto-merge, deploy hook)
- **JSZip** (gerar ZIP no servidor)

## Troubleshooting

### Erro de dependências

```bash
rm -rf node_modules package-lock.json pnpm-lock.yaml
npm install --legacy-peer-deps
```

### Erro de build

```bash
npm run type-check
npm run build -- --debug
```

### Problemas com IA

1. Verifique a API key no Admin
2. Ajuste modelo/temperatura
3. Consulte console do navegador e logs da API

### PR/Auto-merge

- Verifique se o repo permite auto-merge
- Confirme a presença do label `ai-generated`

## Contribuindo

PRs e sugestões são bem-vindos.

## Licença

MIT License

## Suporte

Abra uma issue no GitHub ou use os canais do Vercel.

---
Desenvolvido com ❤️ por um time de IAs orquestradas
