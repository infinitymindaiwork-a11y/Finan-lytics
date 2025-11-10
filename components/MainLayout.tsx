import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { SideNav } from './SideNav';
import { Header } from './Header';
import { StatCard } from './StatCard';
import { IncomeExpenseChart } from './IncomeExpenseChart';
import { SpendingBreakdownChart } from './SpendingBreakdownChart';
import { TransactionsTable } from './TransactionsTable';
import type { AnalysisData, Summary, View, UserProfile, SpendingAlert, Transaction } from '../types';
import { analyzeFinancialStatement } from '../services/geminiService';
import { INITIAL_DATA, CATEGORY_COLORS } from '../constants';
import { TransactionsPage } from './TransactionsPage';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';

interface MainLayoutProps {
    user: UserProfile;
    onLogout: () => void;
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout, theme, onThemeChange }) => {
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [spendingAlerts, setSpendingAlerts] = useState<SpendingAlert[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Local state for settings form to avoid direct mutation of props
    const [profileSettings, setProfileSettings] = useState<UserProfile>(user);
    useEffect(() => {
        setProfileSettings(user);
    }, [user]);

    useEffect(() => {
        if (!analysisData?.transactions) {
            setCategories([]);
            return;
        }
        const allCats = new Set(analysisData.transactions.map(t => t.category));
        Object.keys(CATEGORY_COLORS).forEach(cat => allCats.add(cat));
        setCategories(Array.from(allCats).sort());
    }, [analysisData]);

    const handleUpdateTransaction = useCallback((updatedTx: Transaction) => {
        setAnalysisData(prevData => {
            if (!prevData) return null;
            const txIndex = prevData.transactions.findIndex(t => t.id === updatedTx.id);
            if (txIndex === -1) return prevData;

            const newTransactions = [...prevData.transactions];
            newTransactions[txIndex] = updatedTx;

            return { ...prevData, transactions: newTransactions };
        });
    }, []);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setCurrentView('dashboard');
        setSelectedMonth('all');
        setIsLoading(true);
        setError(null);

        try {
            // Processar todos os arquivos selecionados
            const fileArray = Array.from(files) as File[];
            let cumulativeData: AnalysisData | null = analysisData;

            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];
                setLoadingProgress(`Processando arquivo ${i + 1} de ${fileArray.length}: ${file.name}`);
                console.log(`Processando arquivo ${i + 1} de ${fileArray.length}: ${file.name}`);
                
                const newData = await analyzeFinancialStatement(file);
                
                if (!cumulativeData) {
                    // Primeiro arquivo
                    cumulativeData = newData;
                } else {
                    // Mesclar com dados acumulados
                    const existingIds = new Set(cumulativeData.transactions.map(t => t.id));
                    const newTransactions = newData.transactions.map((t, index) => ({
                        ...t,
                        id: existingIds.has(t.id) ? `${t.id}-${Date.now()}-${index}` : t.id
                    }));

                    const allTransactions = [...cumulativeData.transactions, ...newTransactions];

                    // IMPORTANTE: Somar os saldos de cada conta (não recalcular)
                    const totalBalance = cumulativeData.summary.totalBalance + newData.summary.totalBalance;

                    // Recalcular totais
                    const totalIncome = allTransactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const totalExpenses = allTransactions
                        .filter(t => t.type === 'expense' && t.category !== 'Investimentos')
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                    const totalInvestments = allTransactions
                        .filter(t => t.type === 'expense' && t.category === 'Investimentos')
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                    // Calcular breakdown de gastos
                    const spendingBreakdown = Array.from(
                        allTransactions
                            .filter(t => t.type === 'expense')
                            .reduce((map, t) => {
                                const currentAmount = map.get(t.category) || 0;
                                map.set(t.category, currentAmount + Math.abs(t.amount));
                                return map;
                            }, new Map<string, number>())
                            .entries()
                    )
                    .map(([category, amount]) => ({ category, amount }))
                    .sort((a, b) => b.amount - a.amount);

                    // Recalcular monthly overview com todas as transações
                    const monthlyData = new Map<string, { income: number; expense: number; investments: number }>();
                    
                    allTransactions.forEach(t => {
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
                        }))
                        .sort((a, b) => {
                            // Ordenar por data
                            const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                            const aMonth = a.month.split(' ')[0];
                            const bMonth = b.month.split(' ')[0];
                            return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
                        });

                    cumulativeData = {
                        summary: {
                            totalBalance: totalBalance, // Soma dos saldos de todas as contas
                            monthlyIncome: totalIncome,
                            monthlyExpenses: totalExpenses,
                            monthlyInvestments: totalInvestments,
                            netSavings: totalIncome - totalExpenses - totalInvestments,
                        },
                        transactions: allTransactions,
                        spendingBreakdown,
                        monthlyOverview,
                    };
                }
            }

            setAnalysisData(cumulativeData);
        } catch (err) {
            console.error(err);
            setError('Falha ao analisar o documento. Tente um PDF diferente ou verifique o console para mais detalhes.');
        } finally {
            setIsLoading(false);
            setLoadingProgress('');
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, []);
    
    const handleClearData = useCallback(() => {
        setAnalysisData(null);
        setError(null);
        setSelectedMonth('all');
        setCurrentView('dashboard');
    }, []);
    
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const availableMonths = useMemo(() => {
        if (!analysisData?.transactions) return ['all'];
        const months = new Set(analysisData.transactions.map(t => {
            const parts = t.date.split(' de ');
            return `${parts[1]} de ${parts[2]}`; // "Agosto de 2025"
        }));
        return ['all', ...Array.from(months)];
    }, [analysisData]);

    const displayData = useMemo(() => {
        if (!analysisData) return null;
        
        // Filtrar por mês e categoria
        let filteredTransactions = analysisData.transactions;
        
        if (selectedMonth !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => {
                const monthYear = `${t.date.split(' de ')[1]} de ${t.date.split(' de ')[2]}`;
                return monthYear === selectedMonth;
            });
        }
        
        if (selectedCategory !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === selectedCategory);
        }
        
        const monthlyIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const operationalExpenses = filteredTransactions
            .filter(t => t.type === 'expense' && t.category !== 'Investimentos')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const monthlyInvestments = filteredTransactions
            .filter(t => t.type === 'expense' && t.category === 'Investimentos')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const spendingBreakdown = Array.from(
            filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((map, t) => {
                    const currentAmount = map.get(t.category) || 0;
                    map.set(t.category, currentAmount + Math.abs(t.amount));
                    return map;
                }, new Map<string, number>())
                .entries()
        )
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

        const totalMonthlyExpenses = spendingBreakdown.reduce((sum, item) => sum + item.amount, 0);

        return {
            ...analysisData,
            transactions: filteredTransactions,
            summary: {
                ...analysisData.summary,
                monthlyIncome,
                monthlyExpenses: operationalExpenses,
                monthlyInvestments,
                netSavings: monthlyIncome - operationalExpenses - monthlyInvestments,
            },
            spendingBreakdown,
            totalAllMonthlyExpenses: totalMonthlyExpenses
        };
    }, [analysisData, selectedMonth, selectedCategory]);

    const stats: Summary = displayData?.summary || {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyInvestments: 0,
        netSavings: 0
    };

    const showAllMonthsView = selectedMonth === 'all' && selectedCategory === 'all';
    
    // Título dinâmico para os cards e tabela
    const filterTitle = useMemo(() => {
        if (showAllMonthsView) return 'Mês Atual';
        
        const parts: string[] = [];
        if (selectedMonth !== 'all') parts.push(selectedMonth);
        if (selectedCategory !== 'all') parts.push(selectedCategory);
        
        return parts.join(' - ');
    }, [showAllMonthsView, selectedMonth, selectedCategory]);
    
    const totalExpensesForChart = (displayData as any)?.totalAllMonthlyExpenses ?? displayData?.spendingBreakdown.reduce((sum, item) => sum + item.amount, 0) ?? 0;

    return (
        <div className="flex h-screen w-full font-display text-text-light dark:text-text-dark">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
                multiple
            />
            <SideNav currentView={currentView} onNavigate={setCurrentView} userProfile={user} onLogout={onLogout} />
            <main className="flex-1 overflow-y-auto relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background-dark/80 flex flex-col items-center justify-center z-50">
                        <div className="text-primary" style={{fontSize: '48px'}}>
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        </div>
                        <p className="text-white text-xl mt-4 animate-pulse">
                            {analysisData ? 'Adicionando novos extratos...' : 'Analisando extratos...'}
                        </p>
                        {loadingProgress && (
                            <p className="text-white text-sm mt-2">{loadingProgress}</p>
                        )}
                        <p className="text-text-muted-dark mt-2">
                            {analysisData 
                                ? 'Os dados serão combinados com os extratos anteriores.' 
                                : 'Isso pode levar um momento. Por favor, aguarde.'}
                        </p>
                    </div>
                )}
                
                {!analysisData && !isLoading && currentView !== 'settings' && (
                     <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center h-full">
                        <div className="text-center max-w-md">
                             <div className="text-primary mx-auto mb-4" style={{fontSize: '64px'}}>
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Finan-lytics</h2>
                            <p className="text-text-muted-light dark:text-text-muted-dark mb-2">Para começar, carregue seus extratos bancários em formato PDF.</p>
                            <p className="text-text-muted-light dark:text-text-muted-dark text-sm mb-6">💡 Você pode selecionar vários arquivos de uma vez ou de bancos diferentes!</p>
                             <button
                                onClick={triggerFileUpload}
                                className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-semibold leading-normal shadow-lg hover:bg-primary/90 transition-colors mx-auto"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>upload_file</span>
                                <span className="truncate">Selecionar Extratos</span>
                            </button>
                        </div>
                    </div>
                )}

                {analysisData && currentView === 'dashboard' && (
                  <div className="p-4 sm:p-6 lg:p-8">
                      <Header 
                        onUploadClick={triggerFileUpload}
                        months={availableMonths}
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth} 
                        userName={user.name}
                      />

                      {error && (
                          <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg relative mb-6" role="alert">
                              <strong className="font-bold">Erro: </strong>
                              <span className="block sm:inline">{error}</span>
                          </div>
                      )}
                      
                      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
                          {showAllMonthsView && <StatCard title="Saldo Final" value={formatCurrency(stats.totalBalance)} />}
                          <StatCard title={showAllMonthsView ? "Renda (Mês Atual)" : `Renda (${filterTitle})`} value={formatCurrency(stats.monthlyIncome)} />
                          <StatCard title={showAllMonthsView ? "Despesas (Mês Atual)" : `Despesas (${filterTitle})`} value={formatCurrency(stats.monthlyExpenses)} />
                          <StatCard title={showAllMonthsView ? "Investimentos (Mês Atual)" : `Investimentos (${filterTitle})`} value={formatCurrency(stats.monthlyInvestments)} />
                          <StatCard title={showAllMonthsView ? "Economia (Mês Atual)" : `Economia (${filterTitle})`} value={formatCurrency(stats.netSavings)} />
                      </section>

                      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                          <div className="lg:col-span-3">
                              <IncomeExpenseChart data={analysisData?.monthlyOverview} isLoading={!analysisData} />
                          </div>
                          <div className="lg:col-span-2">
                            <SpendingBreakdownChart data={displayData?.spendingBreakdown} totalExpenses={totalExpensesForChart} isLoading={!displayData}/>
                          </div>
                      </section>

                      {/* Filtros */}
                      <div className="mb-6 p-4 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
                          <div className="flex flex-wrap gap-4 items-center">
                              <div className="flex-1 min-w-[200px]">
                                  <label className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-2">
                                      Filtrar por Mês
                                  </label>
                                  <select
                                      value={selectedMonth}
                                      onChange={(e) => setSelectedMonth(e.target.value)}
                                      className="w-full h-10 px-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right pr-8"
                                      style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
                                  >
                                      <option value="all">Todos os Meses</option>
                                      {availableMonths.filter(m => m !== 'all').map(month => (
                                          <option key={month} value={month}>{month}</option>
                                      ))}
                                  </select>
                              </div>
                              
                              <div className="flex-1 min-w-[200px]">
                                  <label className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-2">
                                      Filtrar por Categoria
                                  </label>
                                  <select
                                      value={selectedCategory}
                                      onChange={(e) => setSelectedCategory(e.target.value)}
                                      className="w-full h-10 px-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right pr-8"
                                      style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
                                  >
                                      <option value="all">Todas as Categorias</option>
                                      {categories.map(cat => (
                                          <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                  </select>
                              </div>
                              
                              {(selectedMonth !== 'all' || selectedCategory !== 'all') && (
                                  <button
                                      onClick={() => {
                                          setSelectedMonth('all');
                                          setSelectedCategory('all');
                                      }}
                                      className="mt-6 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                  >
                                      Limpar Filtros
                                  </button>
                              )}
                          </div>
                      </div>

                      <TransactionsTable 
                        transactions={displayData?.transactions} 
                        isLoading={!displayData} 
                        title={showAllMonthsView ? "Transações Recentes" : `Transações - ${filterTitle}`}
                        categories={categories}
                        onUpdateTransaction={handleUpdateTransaction}
                      />
                  </div>
                )}
                
                {analysisData && currentView === 'transactions' && (
                    <TransactionsPage 
                        transactions={analysisData?.transactions} 
                        isLoading={!analysisData} 
                        categories={categories}
                        onUpdateTransaction={handleUpdateTransaction}
                    />
                )}
                
                {analysisData && currentView === 'reports' && (
                    <ReportsPage transactions={analysisData?.transactions} months={availableMonths.filter(m => m !== 'all')} />
                )}

                {currentView === 'settings' && (
                    <SettingsPage
                        profile={profileSettings}
                        onProfileChange={setProfileSettings}
                        theme={theme}
                        onThemeChange={onThemeChange}
                        onClearData={handleClearData}
                        spendingCategories={categories}
                        alerts={spendingAlerts}
                        onAlertsChange={setSpendingAlerts}
                    />
                )}
            </main>
        </div>
    );
};
