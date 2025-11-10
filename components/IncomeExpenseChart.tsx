import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyOverview } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface IncomeExpenseChartProps {
    data: MonthlyOverview[] | undefined;
    isLoading: boolean;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data, isLoading }) => {
    const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const income = payload.find(p => p.dataKey === 'income');
        const expense = payload.find(p => p.dataKey === 'expense');
        const investments = payload.find(p => p.dataKey === 'investments');

        const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

        return (
          <div className="p-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg">
            <p className="label font-bold text-text-light dark:text-text-dark">{`${label}`}</p>
            {income && <p className="text-success">{`Renda: ${formatCurrency(income.value)}`}</p>}
            {expense && <p className="text-danger">{`Despesa: ${formatCurrency(expense.value)}`}</p>}
            {investments && <p style={{color: CATEGORY_COLORS['Investimentos']}}>{`Investimento: ${formatCurrency(investments.value)}`}</p>}
          </div>
        );
      }
      return null;
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark h-[360px] animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark h-[360px]">
            <h3 className="text-text-light dark:text-text-dark text-lg font-semibold leading-normal">Renda vs. Despesa vs. Investimento</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light, #EAEFF4)" className="dark:stroke-border-dark"/>
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted-light, #AAB8C2)' }} className="dark:fill-text-muted-dark text-xs" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => `R$${Number(value) / 1000}k`} tick={{ fill: 'var(--text-muted-light, #AAB8C2)' }} className="dark:fill-text-muted-dark text-xs" axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(115, 132, 148, 0.1)'}}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{paddingTop: '20px'}}/>
                    <Bar dataKey="income" fill={CATEGORY_COLORS['Renda']} name="Renda" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="expense" fill={CATEGORY_COLORS['Lazer']} name="Despesa" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="investments" fill={CATEGORY_COLORS['Investimentos']} name="Investimento" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};