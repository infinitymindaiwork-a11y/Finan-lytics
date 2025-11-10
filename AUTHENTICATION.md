# Notas sobre Autenticação

## Comportamento do Login com Google

O sistema agora está configurado para:

1. **Sempre solicitar seleção de conta**: Quando você clicar em "Entrar com Google", o sistema irá:
   - Mostrar a tela de seleção de conta do Google
   - Solicitar consentimento para acesso aos dados
   - Isso acontece mesmo em janelas anônimas

2. **Logout completo**: Quando você clicar em "Sair":
   - Remove a sessão do Supabase
   - Limpa o localStorage
   - Recarrega a página para garantir que não há dados em cache
   - Você precisará fazer login novamente na próxima vez

## Comportamento Esperado

### Login
- Clique em "Entrar com Google"
- O Google abrirá uma janela pop-up ou redirecionará
- Você verá a tela de seleção de conta (mesmo que já tenha feito login antes)
- Após selecionar a conta, você será autenticado

### Logout
- Clique no botão "Sair" na barra lateral
- A página será recarregada
- Você voltará para a tela de login
- Na próxima vez que fizer login, precisará selecionar a conta novamente

## Solução de Problemas

### Se o login automático ainda acontecer em janela anônima:

Isso pode ocorrer se:
1. O navegador mantém cookies do Google mesmo em modo anônimo (alguns navegadores fazem isso)
2. A configuração do OAuth do Google no Supabase precisa ser ajustada

**Solução adicional no painel do Supabase:**
1. Vá para Authentication → URL Configuration
2. Certifique-se de que as URLs de redirecionamento estão corretas
3. Em Authentication → Providers → Google
4. Verifique se "Skip nonce check" está desabilitado
5. Adicione um "Site URL" específico

### Se o logout não funcionar:

1. Verifique se há erros no console do navegador
2. Limpe manualmente os cookies e localStorage do navegador
3. Tente em modo anônimo/privado

## Configurações Técnicas Implementadas

### LoginPage.tsx
```typescript
queryParams: {
  access_type: 'offline',
  prompt: 'consent select_account',
}
```

- `prompt: 'consent select_account'`: Força o Google a sempre mostrar a tela de seleção de conta

### App.tsx - handleLogout
```typescript
- Faz signOut no Supabase
- Remove dados do localStorage
- Recarrega a página (window.location.href)
```

Isso garante que:
- Não há dados de sessão residuais
- O estado da aplicação é completamente resetado
- O usuário precisa fazer login novamente
