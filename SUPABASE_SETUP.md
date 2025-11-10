# Configuração Completa do Supabase

## Parte 1: Credenciais (Já configurado ✅)

Suas credenciais já estão configuradas:
- URL: `https://nvfndidxiiaodutcwbcc.supabase.co`
- Anon Key: Configurada no `.env.local`

---

## Parte 2: Criar Estrutura do Banco de Dados

### 🎯 Execute estes comandos SQL no Supabase

Acesse: https://supabase.com/dashboard/project/nvfndidxiiaodutcwbcc/editor

### 1️⃣ Tabela de Perfis de Usuário

```sql
-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2️⃣ Tabela de Transações

```sql
-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver suas próprias transações"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias transações"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
```

### 3️⃣ Tabela de Dados Consolidados

```sql
-- Criar tabela para armazenar análise completa
CREATE TABLE IF NOT EXISTS user_analysis_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  summary JSONB NOT NULL DEFAULT '{}',
  spending_breakdown JSONB NOT NULL DEFAULT '[]',
  monthly_overview JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_analysis_data ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuários podem ver seus próprios dados"
  ON user_analysis_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados"
  ON user_analysis_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON user_analysis_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Índice
CREATE INDEX IF NOT EXISTS idx_user_analysis_data_user_id ON user_analysis_data(user_id);
```

### 4️⃣ Verificar Se Tudo Foi Criado

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'transactions', 'user_analysis_data')
ORDER BY table_name;
```

---

## Como Executar:

1. **Acesse o SQL Editor do Supabase:**
   https://supabase.com/dashboard/project/nvfndidxiiaodutcwbcc/editor

2. **Clique em "New Query"**

3. **Cole TODOS os blocos SQL acima** (pode colar tudo de uma vez)

4. **Clique em RUN** (ou Ctrl+Enter)

5. **Verifique se não há erros** - deve mostrar "Success"

---

## URLs de Redirecionamento (Authentication)

Adicione estas URLs em: https://supabase.com/dashboard/project/nvfndidxiiaodutcwbcc/auth/url-configuration

```
http://localhost:3000
http://localhost:3001  
http://localhost:3002
http://localhost:3003
https://finan-lytics.vercel.app
```

---

## Próximos Passos

Após criar as tabelas, atualize o código React para:
1. ✅ Salvar transações no Supabase ao fazer upload
2. ✅ Carregar transações do Supabase ao fazer login
3. ✅ Salvar/atualizar perfil do usuário
4. ✅ Persistir dados entre sessões

**Me avise quando terminar de executar os comandos SQL!** 🚀
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
