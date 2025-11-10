<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Finan-lytics 💰

**App financeiro inteligente** para acompanhamento do seu fluxo financeiro categorizado e estruturado **automaticamente** através do upload de extratos bancários em PDF.

Desenvolvido com **IA (Google Gemini)** para análise automática de extratos e **Supabase** para autenticação.

View your app in AI Studio: https://ai.studio/apps/drive/1f3GcxVoivheRgN622DKbkqyi9ad29OQW

---

## 🚀 Funcionalidades

- 📄 **Upload de múltiplos extratos** bancários em PDF
- 🤖 **Análise automática** com IA (Google Gemini)
- 📊 **Categorização inteligente** de transações
- 💹 **Gráficos e relatórios** visuais
- 🔍 **Filtros avançados** por mês e categoria
- 🔐 **Autenticação segura** (email/senha e Google OAuth)
- 🎨 **Interface moderna** em dark mode

---

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Google Gemini AI** (análise de extratos)
- **Supabase** (autenticação)
- **Recharts** (visualização de dados)
- **TailwindCSS** (estilização)

---

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Conta Google Cloud (para Gemini API)
- Conta Supabase (para autenticação)

---

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/infinitymindaiwork-a11y/Finan-lytics.git
cd Finan-lytics
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
GEMINI_API_KEY=sua_chave_gemini_aqui
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
```

**Como obter as chaves:**

#### Google Gemini API Key:
1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Clique em "Get API Key"
3. Copie sua chave

#### Supabase:
1. Acesse [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Vá em **Settings** → **API**
4. Copie a **URL** e **anon/public key**

### 4. Configure o Supabase Authentication

Para habilitar autenticação Google:

1. No dashboard do Supabase, vá em **Authentication** → **Providers**
2. Habilite o provider **Google**
3. Configure as **Redirect URLs**:
   ```
   http://localhost:3000
   http://localhost:3001
   http://localhost:3002
   http://localhost:3003
   ```
4. Adicione sua URL de produção (quando fazer deploy)

### 5. Execute o projeto

```bash
npm run dev
```

O app estará disponível em `http://localhost:3003`

---

## 📖 Como usar

1. **Faça login** com email/senha ou Google
2. **Carregue seus extratos** bancários em PDF (pode carregar múltiplos de uma vez)
3. **Aguarde a análise** automática pela IA
4. **Explore seus dados**:
   - Visualize gráficos de receitas, despesas e investimentos
   - Filtre por mês e categoria
   - Analise transações detalhadas
   - Veja relatórios personalizados

---

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Cria build de produção
npm run preview      # Preview do build de produção
npm run lint         # Executa o linter
```

---

## 📂 Estrutura do Projeto

```
finan-lytics/
├── components/          # Componentes React
│   ├── Header.tsx
│   ├── MainLayout.tsx
│   ├── TransactionsPage.tsx
│   └── ...
├── services/           # Serviços (API, Supabase)
│   ├── geminiService.ts
│   └── supabaseClient.ts
├── types.ts            # Definições TypeScript
├── constants.ts        # Constantes da aplicação
└── App.tsx            # Componente principal
```

---

## 🐛 Resolução de Problemas

### Porta em uso
Se a porta 3000-3002 estiver em uso, o Vite automaticamente tentará a próxima disponível (3003, 3004, etc).

### Erro de autenticação
Verifique se:
- As URLs de redirect estão corretas no Supabase
- As variáveis de ambiente estão configuradas
- O projeto Supabase está ativo

### Erro ao analisar PDF
Certifique-se de que:
- A chave do Gemini API está válida
- O PDF é um extrato bancário válido
- O arquivo não está corrompido

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Desenvolvido por

[Infinity Mind AI](https://github.com/infinitymindaiwork-a11y)

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
