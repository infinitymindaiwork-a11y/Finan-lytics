# Configuração do Vercel para Finan-lytics

## Passo a Passo para Deploy no Vercel

### 1. Configure as Variáveis de Ambiente no Vercel

Acesse o dashboard do seu projeto no Vercel e vá em:
**Settings** → **Environment Variables**

Adicione as seguintes variáveis:

| Nome da Variável | Valor | Ambiente |
|-----------------|-------|----------|
| `GEMINI_API_KEY` | Sua chave da API Gemini | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://nvfndidxiiaodutcwbcc.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anônima do Supabase | Production, Preview, Development |

**⚠️ IMPORTANTE:** 
- Certifique-se de marcar todos os ambientes (Production, Preview, Development)
- Todas as variáveis que começam com `VITE_` são expostas no client-side
- Nunca exponha a Service Role Key do Supabase no frontend

### 2. Configure o Supabase

No dashboard do Supabase, adicione a URL do Vercel nas **Redirect URLs**:

1. Vá em **Authentication** → **URL Configuration**
2. Adicione em **Redirect URLs**:
   ```
   https://seu-projeto.vercel.app
   https://seu-projeto.vercel.app/**
   ```

### 3. Configurações do Build

O Vercel detectará automaticamente que é um projeto Vite. Caso precise configurar manualmente:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Redeploy

Após adicionar as variáveis de ambiente:
1. Vá em **Deployments**
2. Clique nos três pontos do último deployment
3. Selecione **Redeploy**

### 5. Teste o Upload de PDF

Após o deploy:
1. Acesse seu site no Vercel
2. Faça login
3. Tente fazer upload de um extrato bancário PDF
4. Verifique se a análise funciona corretamente

## Troubleshooting

### Erro: "GEMINI_API_KEY não está configurado"
- Verifique se adicionou a variável no Vercel
- Certifique-se de ter feito redeploy após adicionar as variáveis
- Verifique se o nome está correto: `GEMINI_API_KEY` (não `API_KEY`)

### Erro: "Supabase Auth Error"
- Adicione a URL do Vercel nas Redirect URLs do Supabase
- Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos

### Upload de PDF não funciona
- Abra o console do navegador (F12) e verifique erros
- Certifique-se de que a chave do Gemini está ativa e com cota disponível
- Verifique se o PDF não está muito grande (limite de 20MB)

### Erro de CORS
- Adicione a URL do Vercel nas configurações de CORS do Supabase
- Em **Settings** → **API** → **CORS**, adicione `https://seu-projeto.vercel.app`

## Verificação Rápida

Execute este checklist antes de fazer deploy:

- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] URL do Vercel adicionada no Supabase (Redirect URLs)
- [ ] Redeploy realizado após adicionar variáveis
- [ ] Teste de login funcionando
- [ ] Teste de upload de PDF funcionando

## Comandos Úteis

```bash
# Deploy manual (caso esteja usando Vercel CLI)
vercel --prod

# Ver logs de produção
vercel logs

# Listar variáveis de ambiente
vercel env ls
```

## Notas Importantes

1. **Segurança:** Nunca commite o arquivo `.env.local` no Git. Ele já está no `.gitignore`.
2. **Builds:** O Vercel automaticamente faz rebuild quando você faz push para o GitHub.
3. **Domains:** Configure um domínio customizado em **Settings** → **Domains**.
4. **Analytics:** Ative o Vercel Analytics para monitorar o desempenho.
