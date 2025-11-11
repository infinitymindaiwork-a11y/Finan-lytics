import { supabase } from './supabaseClient';
import type { AnalysisData, Transaction, UserProfile } from '../types';

// ============ PERFIL DO USUÁRIO ============

export const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('❌ Nenhum usuário autenticado');
            return null;
        }

        console.log('📝 Buscando perfil para usuário:', user.id);

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('❌ Erro ao buscar perfil:', error);
            throw error;
        }

        console.log('✅ Perfil encontrado no banco:', data);

        const profile = {
            name: data?.name || user.email || '',
            email: data?.email || user.email || '',
            imageUrl: data?.avatar_url || undefined,
        };

        console.log('✅ Perfil retornado:', profile);

        return profile;
    } catch (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return null;
    }
};

export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ Usuário não autenticado');
            return false;
        }

        console.log('📝 Salvando perfil para usuário:', user.id);
        console.log('📝 Dados do perfil:', profile);

        const profileData = {
            id: user.id,
            name: profile.name,
            email: profile.email || user.email,
            avatar_url: profile.imageUrl,
        };

        console.log('📝 Objeto sendo enviado:', profileData);

        const { data, error } = await supabase
            .from('profiles')
            .upsert(profileData, {
                onConflict: 'id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Erro do Supabase:', error);
            console.error('❌ Código do erro:', error.code);
            console.error('❌ Mensagem:', error.message);
            console.error('❌ Detalhes:', error.details);
            throw error;
        }
        
        console.log('✅ Perfil salvo com sucesso!', data);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar perfil:', error);
        return false;
    }
};

// ============ TRANSAÇÕES ============

export const saveTransactions = async (transactions: Transaction[]): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const transactionsToSave = transactions.map(t => ({
            id: t.id,
            user_id: user.id,
            date: t.date,
            description: t.description,
            category: t.category,
            amount: t.amount,
            type: t.type,
        }));

        const { error } = await supabase
            .from('transactions')
            .upsert(transactionsToSave, { onConflict: 'id' });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao salvar transações:', error);
        return false;
    }
};

export const loadTransactions = async (): Promise<Transaction[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) throw error;

        return (data || []).map(t => ({
            id: t.id,
            date: t.date,
            description: t.description,
            category: t.category,
            amount: parseFloat(t.amount),
            type: t.type as 'income' | 'expense',
        }));
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        return [];
    }
};

export const updateTransaction = async (transaction: Transaction): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('transactions')
            .update({
                date: transaction.date,
                description: transaction.description,
                category: transaction.category,
                amount: transaction.amount,
                type: transaction.type,
                updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.id)
            .eq('user_id', user.id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        return false;
    }
};

export const deleteAllUserData = async (): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Deletar transações
        await supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id);

        // Deletar dados de análise
        await supabase
            .from('user_analysis_data')
            .delete()
            .eq('user_id', user.id);

        return true;
    } catch (error) {
        console.error('Erro ao deletar dados:', error);
        return false;
    }
};

// ============ DADOS DE ANÁLISE COMPLETOS ============

export const saveAnalysisData = async (data: AnalysisData): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Salvar transações
        await saveTransactions(data.transactions);

        // Salvar resumo e breakdown
        const { error } = await supabase
            .from('user_analysis_data')
            .upsert({
                user_id: user.id,
                summary: data.summary,
                spending_breakdown: data.spendingBreakdown,
                monthly_overview: data.monthlyOverview,
                updated_at: new Date().toISOString(),
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados de análise:', error);
        return false;
    }
};

export const loadAnalysisData = async (): Promise<AnalysisData | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Carregar transações
        const transactions = await loadTransactions();
        if (transactions.length === 0) return null;

        // Carregar dados consolidados
        const { data, error } = await supabase
            .from('user_analysis_data')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            // Se não existe dados consolidados, recalcular
            return recalculateAnalysisData(transactions);
        }

        return {
            summary: data.summary,
            transactions,
            spendingBreakdown: data.spending_breakdown,
            monthlyOverview: data.monthly_overview,
        };
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return null;
    }
};

// Função auxiliar para recalcular dados quando necessário
const recalculateAnalysisData = (transactions: Transaction[]): AnalysisData => {
    const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && t.category !== 'Investimentos')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyInvestments = transactions
        .filter(t => t.type === 'expense' && t.category === 'Investimentos')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const spendingBreakdown = Array.from(
        transactions
            .filter(t => t.type === 'expense')
            .reduce((map, t) => {
                const current = map.get(t.category) || 0;
                map.set(t.category, current + Math.abs(t.amount));
                return map;
            }, new Map<string, number>())
            .entries()
    )
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

    // Calcular overview mensal
    const monthlyData = new Map<string, { income: number; expense: number; investments: number }>();
    
    transactions.forEach(t => {
        const parts = t.date.split(' de ');
        const monthYear = `${parts[1]?.substring(0, 3)} ${parts[2]}` || 'Desconhecido';
        
        if (!monthlyData.has(monthYear)) {
            monthlyData.set(monthYear, { income: 0, expense: 0, investments: 0 });
        }
        
        const data = monthlyData.get(monthYear)!;
        if (t.type === 'income') {
            data.income += t.amount;
        } else if (t.category === 'Investimentos') {
            data.investments += Math.abs(t.amount);
        } else {
            data.expense += Math.abs(t.amount);
        }
    });

    const monthlyOverview = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
            month,
            income: data.income,
            expense: data.expense,
            investments: data.investments
        }));

    return {
        summary: {
            totalBalance: monthlyIncome - monthlyExpenses - monthlyInvestments,
            monthlyIncome,
            monthlyExpenses,
            monthlyInvestments,
            netSavings: monthlyIncome - monthlyExpenses - monthlyInvestments,
        },
        transactions,
        spendingBreakdown,
        monthlyOverview,
    };
};
