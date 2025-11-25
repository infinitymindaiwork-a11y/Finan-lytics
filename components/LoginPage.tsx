import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [message, setMessage] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('✅ Email de recuperação enviado! Verifique sua caixa de entrada.');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('✅ Verifique seu email para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (error: any) {
      setMessage('❌ ' + (error.message || 'Erro ao processar solicitação'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        // Força o Google a sempre pedir qual conta usar
        queryParams: {
          access_type: 'offline',
          prompt: 'consent select_account',
        },
      },
    });

    if (error) {
      console.error(error);
      alert('Erro ao entrar com Google: ' + error.message);
      return;
    }

    if (onLoginSuccess) onLoginSuccess();
  }

  return (
    <div className="flex items-center justify-center h-screen w-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="text-center p-8 max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>query_stats</span>
          </div>
          <h1 className="text-4xl font-bold">Finan-lytics</h1>
        </div>
        <p className="text-text-muted-light dark:text-text-muted-dark mb-8">
          Seu assistente financeiro com IA. Faça login para começar.
        </p>

        {/* Login com Email e Senha */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark"
          />
          {mode !== 'forgot' && (
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark"
            />
          )}
          
          {message && (
            <p className={`text-sm ${message.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Enviar Email de Recuperação'}
          </button>
          
          <div className="flex flex-col gap-2">
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setMessage(null); }}
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            )}
            <button
              type="button"
              onClick={() => { 
                setMode(mode === 'signin' ? 'signup' : 'signin'); 
                setMessage(null); 
              }}
              className="text-sm text-primary hover:underline"
            >
              {mode === 'forgot' ? 'Voltar para o login' : mode === 'signin' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </form>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light dark:border-border-dark"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background-light dark:bg-background-dark text-text-muted-light dark:text-text-muted-dark">
              ou
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {/* ícone do google */}
          <svg className="w-6 h-6" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h13.04c-.58 2.82-2.31 5.25-4.78 6.92l7.98 6.19C45.33 36.6 48 31.1 48 24c0-.66-.05-1.31-.15-1.95l-1.02-.5z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.98-6.19c-2.11 1.45-4.82 2.3-7.91 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          <span>Entrar com o Google</span>
        </button>
      </div>
    </div>
  );
};
