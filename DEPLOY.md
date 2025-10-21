# Guia de Deploy no Vercel

## Deploy Automático via v0

1. **Clique em "Publish"** no canto superior direito da interface do v0
2. Aguarde o processo de build e deploy
3. Sua aplicação estará disponível em uma URL pública

## Configurações Necessárias

### Variáveis de Ambiente (Opcional)

Se você configurou uma API key do Gemini na área admin, ela é armazenada localmente no navegador. Para usar em produção:

1. Acesse o dashboard do Vercel
2. Vá em Settings → Environment Variables
3. Adicione (se necessário):
   - `GEMINI_API_KEY` - Sua chave da API do Gemini (opcional)

### Após o Deploy

1. Acesse a URL fornecida pelo Vercel
2. Configure sua API key na área Admin (/admin)
3. Comece a usar o sistema multiagente!

## Recursos da Aplicação

- ✅ Dashboard com visualização de agentes
- ✅ Sistema de chat para atribuir tarefas
- ✅ Geração automática de código
- ✅ Área admin para configurações
- ✅ Preview de aplicações geradas
- ✅ Tema escuro
- ✅ Responsivo para mobile

## Suporte

Se encontrar problemas no deploy:
1. Verifique os logs de build no Vercel
2. Certifique-se de que todas as dependências estão instaladas
3. Abra um ticket de suporte em vercel.com/help
