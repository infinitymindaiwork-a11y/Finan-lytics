import React, { useState } from 'react';
import type { Transaction } from '../types';

interface MonthlySummary {
    income: number;
    expenses: number;
    investments: number;
    netSavings: number;
}

interface ComparisonResult {
    month1: { name: string; summary: MonthlySummary };
    month2: { name: string; summary: MonthlySummary };
    diff: {
        income: number;
        expenses: number;
        investments: number;
        netSavings: number;
    };
    percentDiff: {
        income: number;
        expenses: number;
        investments: number;
        netSavings: number;
    };
}

const FilterSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
     <select {...props} className="w-full h-10 px-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}>
        {props.children}
    </select>
);

const ComparisonStat: React.FC<{ label: string; value: number; percentage: number; isPositiveGood?: boolean }> = ({ label, value, percentage, isPositiveGood = true }) => {
    const isPositive = value >= 0;
    const isZero = value === 0 && percentage === 0;
    let colorClass = 'text-text-muted-light dark:text-text-muted-dark';
    if (!isZero) {
        colorClass = (isPositive === isPositiveGood) ? 'text-success' : 'text-danger';
    }
    const icon = isPositive ? 'arrow_upward' : 'arrow_downward';
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between py-4`}>
            <span className="font-medium text-text-light dark:text-text-dark">{label}</span>
            <div className={`flex items-center gap-2 font-semibold ${colorClass}`}>
                {!isZero && <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>}
                <span>{formatCurrency(Math.abs(value))}</span>
                <span className="text-xs font-normal">({isFinite(percentage) ? percentage.toFixed(1) : '...'}%)</span>
            </div>
        </div>
    );
};


export const ReportsPage: React.FC<{ transactions: Transaction[], months: string[] }> = ({ transactions, months }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    
    const [month1, setMonth1] = useState(months.length > 0 ? months[0] : '');
    const [month2, setMonth2] = useState(months.length > 1 ? months[1] : '');
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

    const handleExport = () => {
        let dataToExport = transactions;

        if (selectedPeriod !== 'all') {
            dataToExport = transactions.filter(t => {
                const monthYear = `${t.date.split(' de ')[1]} de ${t.date.split(' de ')[2]}`;
                return monthYear === selectedPeriod;
            });
        }
        
        if (dataToExport.length === 0) {
            alert('Nenhuma transação encontrada para o período selecionado.');
            return;
        }

        const headers = ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo'];
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(t => [
                `"${t.date}"`,
                `"${t.description.replace(/"/g, '""')}"`,
                t.category,
                t.amount,
                t.type
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `relatorio_transacoes_${selectedPeriod.replace(/ /g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCompare = () => {
        if (!month1 || !month2 || month1 === month2) {
            setComparisonResult(null);
            alert('Por favor, selecione dois meses diferentes para comparar.');
            return;
        }

        const calculateMonthSummary = (month: string): MonthlySummary => {
            const monthTransactions = transactions.filter(t => {
                const monthYear = `${t.date.split(' de ')[1]} de ${t.date.split(' de ')[2]}`;
                return monthYear === month;
            });

            const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = monthTransactions.filter(t => t.type === 'expense' && t.category !== 'Investimentos').reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const investments = monthTransactions.filter(t => t.type === 'expense' && t.category === 'Investimentos').reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const netSavings = income - expenses;
            
            return { income, expenses, investments, netSavings };
        };

        const summary1 = calculateMonthSummary(month1);
        const summary2 = calculateMonthSummary(month2);

        const calculateDiff = (val1: number, val2: number) => val2 - val1;
        const calculatePercentDiff = (val1: number, val2: number) => {
            if (val1 === 0 && val2 === 0) return 0;
            if (val1 === 0) return val2 > 0 ? 100 : -100;
            return ((val2 - val1) / Math.abs(val1)) * 100;
        };
        
        setComparisonResult({
            month1: { name: month1, summary: summary1 },
            month2: { name: month2, summary: summary2 },
            diff: {
                income: calculateDiff(summary1.income, summary2.income),
                expenses: calculateDiff(summary1.expenses, summary2.expenses),
                investments: calculateDiff(summary1.investments, summary2.investments),
                netSavings: calculateDiff(summary1.netSavings, summary2.netSavings),
            },
            percentDiff: {
                income: calculatePercentDiff(summary1.income, summary2.income),
                expenses: calculatePercentDiff(summary1.expenses, summary2.expenses),
                investments: calculatePercentDiff(summary1.investments, summary2.investments),
                netSavings: calculatePercentDiff(summary1.netSavings, summary2.netSavings),
            }
        });
    };
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    const getMetricLabel = (key: string) => {
        switch (key) {
            case 'income': return 'Renda';
            case 'expenses': return 'Despesas';
            case 'investments': return 'Investimentos';
            case 'netSavings': return 'Economia';
            default: return key;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">Relatórios</h1>
                <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">Gere relatórios e compare seu desempenho financeiro.</p>
            </header>

            <div className="space-y-8 max-w-3xl mx-auto">
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                     <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">Comparativo Mensal</h2>
                     <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1 mb-4">Selecione dois meses para comparar seus principais indicadores financeiros.</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="month1-select" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">
                                Mês 1
                            </label>
                            <FilterSelect id="month1-select" value={month1} onChange={(e) => setMonth1(e.target.value)}>
                                {months.map(month => <option key={month} value={month}>{month}</option>)}
                            </FilterSelect>
                        </div>
                        <div>
                            <label htmlFor="month2-select" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">
                                Mês 2
                            </label>
                            <FilterSelect id="month2-select" value={month2} onChange={(e) => setMonth2(e.target.value)}>
                                {months.map(month => <option key={month} value={month}>{month}</option>)}
                            </FilterSelect>
                        </div>
                     </div>
                     <button
                        onClick={handleCompare}
                        className="mt-4 w-full sm:w-auto flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>compare_arrows</span>
                        <span className="truncate">Comparar</span>
                    </button>
                </div>
                
                {comparisonResult && (
                    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">
                            Resultado: <span className="text-primary">{comparisonResult.month1.name}</span> vs <span className="text-primary">{comparisonResult.month2.name}</span>
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-4 text-center mb-2 border-b border-border-light dark:border-border-dark pb-2">
                            <div className="text-left font-bold text-text-light dark:text-text-dark">Indicador</div>
                            <div className="font-semibold text-text-muted-light dark:text-text-muted-dark">{comparisonResult.month1.name}</div>
                            <div className="font-semibold text-text-muted-light dark:text-text-muted-dark">{comparisonResult.month2.name}</div>
                        </div>
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                             {Object.keys(comparisonResult.month1.summary).map((key) => (
                                 <div key={key} className="grid grid-cols-3 gap-4 py-3 items-center">
                                     <div className="text-left font-medium text-text-light dark:text-text-dark capitalize">{getMetricLabel(key)}</div>
                                     <div className="text-center text-sm text-text-muted-light dark:text-text-muted-dark">{formatCurrency(comparisonResult.month1.summary[key as keyof MonthlySummary])}</div>
                                     <div className="text-center text-sm text-text-muted-light dark:text-text-muted-dark">{formatCurrency(comparisonResult.month2.summary[key as keyof MonthlySummary])}</div>
                                 </div>
                             ))}
                        </div>

                        <div className="mt-6 border-t border-border-light dark:border-border-dark pt-4">
                            <h4 className="font-semibold text-text-light dark:text-text-dark mb-2">Análise da Diferença</h4>
                            <div className="divide-y divide-border-light dark:divide-border-dark">
                                <ComparisonStat label="Renda" value={comparisonResult.diff.income} percentage={comparisonResult.percentDiff.income} isPositiveGood={true} />
                                <ComparisonStat label="Despesas" value={comparisonResult.diff.expenses} percentage={comparisonResult.percentDiff.expenses} isPositiveGood={false} />
                                <ComparisonStat label="Investimentos" value={comparisonResult.diff.investments} percentage={comparisonResult.percentDiff.investments} isPositiveGood={true} />
                                <ComparisonStat label="Economia Líquida" value={comparisonResult.diff.netSavings} percentage={comparisonResult.percentDiff.netSavings} isPositiveGood={true} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                     <h2 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Exportar Transações</h2>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="period-select" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">
                                Selecione o Período
                            </label>
                            <FilterSelect id="period-select" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                                <option value="all">Extrato Completo</option>
                                {months.map(month => <option key={month} value={month}>{month}</option>)}
                            </FilterSelect>
                        </div>
                         <button
                            onClick={handleExport}
                            className="w-full flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal shadow-sm hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>
                            <span className="truncate">Exportar para CSV</span>
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};
