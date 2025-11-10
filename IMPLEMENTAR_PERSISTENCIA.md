# 🔥 IMPLEMENTAR PERSISTÊNCIA DE DADOS - GUIA COMPLETO

## 📋 O QUE VAI ACONTECER

Atualmente, quando você:
- ❌ Recarrega a página (F5) → Perde todos os dados
- ❌ Sai e volta → Perde todos os dados  
- ❌ Muda foto/nome → Não salva

Após implementar:
- ✅ Recarregar a página → Dados permanecem
- ✅ Sair e voltar → Dados restaurados
- ✅ Mudar foto/nome → Salvos no banco
- ✅ Cada usuário tem seus próprios dados isolados

---

## 🎯 PASSO 1: Criar Tabelas no Supabase

### Acesse o SQL Editor:
https://supabase.com/dashboard/project/nvfndidxiiaodutcwbcc/editor

### Clique em "New Query" e cole TODO este código:

```sql
-- 1. Tabela de Perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver seu proprio perfil"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar seu proprio perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios podem inserir seu proprio perfil"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

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

-- 2. Tabela de Transacoes
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

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver suas proprias transacoes"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir suas proprias transacoes"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar suas proprias transacoes"
  ON transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar suas proprias transacoes"
  ON transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- 3. Tabela de Dados Consolidados
CREATE TABLE IF NOT EXISTS user_analysis_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  summary JSONB NOT NULL DEFAULT '{}',
  spending_breakdown JSONB NOT NULL DEFAULT '[]',
  monthly_overview JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_analysis_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver seus proprios dados"
  ON user_analysis_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir seus proprios dados"
  ON user_analysis_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar seus proprios dados"
  ON user_analysis_data FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_analysis_data_user_id ON user_analysis_data(user_id);
```

### Clique em RUN (ou Ctrl+Enter)

### Verificar se criou:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'transactions', 'user_analysis_data')
ORDER BY table_name;
```

Deve mostrar as 3 tabelas! ✅

---

## 🎯 PASSO 2: Arquivos Já Criados

✅ **dataService.ts** - Serviço para salvar/carregar dados do Supabase (já criado!)

Agora preciso atualizar o MainLayout para usar esse serviço.

---

## ⏭️ PRÓXIMOS PASSOS

Depois de executar o SQL:

1. ✅ Execute todo o código SQL no Supabase
2. ⏳ Vou atualizar o MainLayout.tsx para usar o dataService
3. ⏳ Vou atualizar o SettingsPage para salvar perfil
4. ⏳ Testar: Upload de extrato → F5 → Dados devem permanecer!

---

**Me avise quando terminar de executar o SQL no Supabase!** 🚀

Depois eu atualizo o código React para usar o banco automaticamente.
