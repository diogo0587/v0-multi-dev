# Multiagente IA - Sistema de Desenvolvimento Automatizado

Sistema completo de desenvolvimento automatizado usando múltiplos agentes de IA que trabalham em equipe para criar aplicações web.

## Visão Geral

Este sistema funciona como uma equipe completa de desenvolvimento, com agentes especializados que colaboram para criar aplicações:

- **Orquestrador**: Coordena a equipe e distribui tarefas
- **Analista de Requisitos**: Analisa e documenta requisitos
- **Desenvolvedor Frontend**: Cria interfaces e componentes React/Next.js
- **Desenvolvedor Backend**: Implementa APIs e lógica de servidor
- **DevOps**: Configura deployment e infraestrutura

## Funcionalidades

- Geração automática de código por múltiplos agentes de IA
- Dashboard em tempo real mostrando status dos agentes
- Sistema de chat para atribuir tarefas
- Preview de aplicações geradas
- Área admin para configuração e visualização
- Sistema de manutenção para iterar no código gerado
- Tema escuro e responsivo para mobile

## Requisitos

- Node.js 18+ ou 20+
- npm ou pnpm
- Conta Vercel (para deploy)

## Instalação

### Desenvolvimento Local

\`\`\`bash
# Instalar dependências
npm install --legacy-peer-deps

# Executar em modo desenvolvimento
npm run dev

# Abrir http://localhost:3000
\`\`\`

### Build de Produção

\`\`\`bash
# Criar build otimizado
npm run build

# Executar build de produção
npm start
\`\`\`

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
# Opcional: API Key do Gemini (se quiser usar seu próprio)
GEMINI_API_KEY=sua_api_key_aqui

# Opcional: Outras configurações
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Configuração via Interface

1. Acesse a área Admin clicando no botão "Admin" no dashboard
2. Na tab "Configurações", insira sua API key do Gemini (opcional)
3. As configurações são salvas no localStorage do navegador

## Deploy na Vercel

### Opção 1: Deploy Direto do v0

1. Clique no botão "Publish" no topo da interface do v0
2. O deploy será feito automaticamente

### Opção 2: Deploy via GitHub

1. Faça push do código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe seu repositório
5. Configure as variáveis de ambiente (se necessário)
6. Clique em "Deploy"

### Opção 3: Deploy via CLI

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Deploy para produção
vercel --prod
\`\`\`

## Uso

### Criar uma Aplicação

1. No dashboard principal, use o chat para descrever o que deseja criar
2. Exemplo: "Criar um dashboard de vendas com gráficos"
3. Os agentes trabalharão em equipe para gerar o código
4. Visualize o progresso de cada agente em tempo real
5. Os arquivos gerados aparecerão na interface

### Visualizar Aplicação Gerada

1. Acesse a área Admin
2. Na tab "Preview", veja a aplicação funcionando
3. Na tab "Arquivos", visualize e baixe os arquivos gerados

### Fazer Manutenção

1. Use o painel de manutenção no dashboard
2. Descreva as alterações desejadas
3. Os agentes processarão as modificações mantendo o contexto

### Aplicar Arquivos ao Projeto

1. Quando os arquivos forem gerados, clique em "Aplicar ao Projeto"
2. Siga as instruções para integrar o código ao seu projeto

## Estrutura do Projeto

\`\`\`
multiagente-ia/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Dashboard principal
│   ├── admin/             # Área administrativa
│   ├── preview/           # Preview de aplicações
│   └── api/               # API routes
│       └── agent/         # Endpoints dos agentes
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── agent-*.tsx       # Componentes dos agentes
│   ├── chat-*.tsx        # Sistema de chat
│   └── *.tsx             # Outros componentes
├── lib/                   # Bibliotecas e utilitários
│   ├── agents/           # Lógica dos agentes
│   ├── context/          # Contextos React
│   └── types/            # Tipos TypeScript
└── public/               # Arquivos estáticos
\`\`\`

## Tecnologias

- **Next.js 15**: Framework React
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Tailwind CSS v4**: Estilização
- **shadcn/ui**: Componentes UI
- **Vercel AI SDK**: Integração com IA
- **Lucide React**: Ícones

## Troubleshooting

### Erro de dependências

\`\`\`bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json pnpm-lock.yaml
npm install --legacy-peer-deps
\`\`\`

### Erro de build

\`\`\`bash
# Verificar erros de TypeScript
npm run lint

# Build com logs detalhados
npm run build -- --debug
\`\`\`

### Problemas com IA

1. Verifique se a API key está configurada corretamente
2. Teste a conexão na área Admin
3. Verifique os logs no console do navegador

## Contribuindo

Este é um projeto de código aberto. Contribuições são bem-vindas!

## Licença

MIT License - veja LICENSE para detalhes

## Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do Vercel.

---

Desenvolvido com ❤️ usando v0 e Vercel AI SDK
