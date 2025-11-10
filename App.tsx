import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import type { UserProfile } from './types';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);

  // tema (isso já tava bom, deixei)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  // 👇 aqui é a parte nova: pegar sessão do Supabase
  useEffect(() => {
    // primeira checada
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (data.session) {
        const sUser = data.session.user;
        setUser({
          name: sUser.user_metadata.full_name || sUser.email || 'Usuário',
          email: sUser.email || '',
          imageUrl: sUser.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${sUser.email}`
        });
      } else {
        setUser(null);
        // Limpar qualquer dado residual quando não há sessão
        localStorage.removeItem('supabase.auth.token');
      }
      setLoading(false);
    });

    // escutar login/logout em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sUser = session.user;
        setUser({
          name: sUser.user_metadata.full_name || sUser.email || 'Usuário',
          email: sUser.email || '',
          imageUrl: sUser.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${sUser.email}`
        });
      } else {
        setUser(null);
        // Limpar dados quando o evento indica logout
        localStorage.removeItem('supabase.auth.token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Fazer logout do Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
      
      // Limpar estado do usuário
      setUser(null);
      
      // Limpar possíveis dados em cache/localStorage
      localStorage.removeItem('supabase.auth.token');
      
      // Forçar reload da página para limpar completamente a sessão
      window.location.href = window.location.origin;
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setUser(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <>
      {!user ? (
        // agora o LoginPage não precisa mais receber o onLoginSuccess
        <LoginPage />
      ) : (
        <MainLayout
          user={user}
          onLogout={handleLogout}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}
    </>
  );
};

export default App;
