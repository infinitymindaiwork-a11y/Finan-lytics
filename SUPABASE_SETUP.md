# Como Obter as Credenciais Corretas do Supabase

## Passo a Passo:

### 1. Acesse o Supabase
- Vá para: https://app.supabase.com/
- Faça login com sua conta

### 2. Selecione ou Crie um Projeto
- Se você já tem um projeto, selecione-o
- Se não tem, clique em "New Project" e crie um novo

### 3. Obtenha as Credenciais
- No painel do projeto, vá em **Settings** (Configurações) no menu lateral
- Clique em **API** 
- Você verá:
  - **Project URL** (URL do Projeto) - Ex: `https://xxxxxxxxxx.supabase.co`
  - **anon public** key - Uma chave longa começando com `eyJ...`

### 4. Atualize o .env.local
Copie as credenciais e cole no arquivo `.env.local`:

```env
GEMINI_API_KEY=AIzaSyDNlRswS_k5FyrjA1h_imKflG0m9o9PVMc
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

### 5. Configure o Google OAuth

Depois de configurar as credenciais:

1. No Supabase, vá em **Authentication** → **Providers**
2. Encontre **Google** e clique para configurar
3. Você precisará:
   - Criar um projeto no Google Cloud Console
   - Obter Client ID e Client Secret
   - Adicionar as URLs de redirecionamento

#### URLs de Redirecionamento para adicionar:
```
http://localhost:3002
http://localhost:3000
http://localhost:3001
```

### 6. Reinicie o Servidor
Após atualizar o `.env.local`:
```bash
# Pare o servidor (Ctrl+C)
# Execute novamente:
npm run dev
```

---

## Verificação Rápida

Se você não tem certeza se o projeto Supabase está ativo:

1. Acesse https://app.supabase.com/
2. Veja se seu projeto aparece na lista
3. Clique no projeto para ver se está ativo (não pausado)

## Projeto Pausado?

Se o projeto estiver pausado:
- Clique em "Resume" (Retomar)
- Aguarde alguns minutos para reativar

Se o projeto foi deletado:
- Você precisará criar um novo projeto
- Obter novas credenciais
- Reconfigurar o Google OAuth

---

**Importante:** Após obter as credenciais corretas, me avise que eu ajudo a atualizar o arquivo!
