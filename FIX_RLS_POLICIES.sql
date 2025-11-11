-- ========================================
-- FIX: Políticas RLS para tabela profiles
-- ========================================
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nvfndidxiiaodutcwbcc/sql

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON profiles;

-- 2. Criar políticas corretas com ALL operations
CREATE POLICY "Usuários podem gerenciar seu próprio perfil"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Verificar se RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
