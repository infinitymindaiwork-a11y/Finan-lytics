-- ========================================
-- FIX: Adicionar colunas faltantes na tabela profiles
-- ========================================
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nvfndidxiiaodutcwbcc/sql

-- 1. Verificar colunas existentes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Adicionar colunas se não existirem
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Verificar novamente as colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
