import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SpendingBreakdown } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface SpendingBreakdownChartProps {
    data: SpendingBreakdown[] | undefined;
    totalExpenses: number;
    isLoading: boolean;
}

interface CustomLegendProps {
    payload: any[];
    onLegendClick: (category: string) => void;
    hiddenCategories: string[];
}

const CustomLegend: React.FC<CustomLegendProps> = ({ payload, onLegendClick, hiddenCategories }) => {
    return (
        <div className="flex flex-col gap-2 text-sm">
            {payload.map((entry: any, index: number) => {
                const isHidden = hiddenCategories.includes(entry.value);
                return (
                     <button
                        key={`item-${index}`}
                        onClick={() => onLegendClick(entry.value)}
                        className={`flex items-center gap-2 cursor-pointer transition-opacity text-left ${isHidden ? 'opacity-40 line-through' : 'opacity-100'}`}
                        aria-pressed={!isHidden}
                        aria-label={`Alternar visibilidade para a categoria ${entry.value}`}
                    >
                        <div style={{ backgroundColor: entry.color }} className="size-2.5 rounded-full flex-shrink-0"></div>
                        <span className="text-text-light dark:text-text-dark truncate">{entry.value}</span>
                    </button>
                );
            })}
        </div>
    );
};


export const SpendingBreakdownChart: React.FC<SpendingBreakdownChartProps> = ({ data, isLoading }) => {
    const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

    const handleLegendClick = (category: string) => {
        setHiddenCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const visibleData = useMemo(() => {
        return data?.filter(item => !hiddenCategories.includes(item.category)) || [];
    }, [data, hiddenCategories]);

    const visibleTotalExpenses = useMemo(() => {
        return visibleData.reduce((sum, item) => sum + item.amount, 0);
    }, [visibleData]);
    
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark h-[360px] animate-pulse">
                 <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                 <div className="flex-1 grid grid-cols-2 gap-4 items-center">
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>)}
                    </div>
                 </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark h-[360px]">
            <h3 className="text-text-light dark:text-text-dark text-lg font-semibold leading-normal mb-2">Análise de Despesas</h3>
            <div className="flex-1 grid md:grid-cols-2 gap-4 items-center">
                <div className="col-span-1 relative h-full min-h-[220px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={visibleData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius="70%"
                                outerRadius="100%"
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="amount"
                                nameKey="category"
                            >
                                {visibleData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Outros']} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                                contentStyle={{ 
                                    backgroundColor: 'var(--card-light, #FFFFFF)', 
                                    border: '1px solid var(--border-light, #EAEFF4)',
                                    borderRadius: '0.5rem'
                                }}
                                wrapperClassName="dark:bg-card-dark dark:border-border-dark"
                             />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm text-text-muted-light dark:text-text-muted-dark">Total Gasto</span>
                        <span className="text-3xl font-bold text-text-light dark:text-text-dark">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(visibleTotalExpenses)}
                        </span>
                    </div>
                </div>
                <div className="col-span-1 max-h-[250px] overflow-y-auto pr-2">
                    <CustomLegend 
                        payload={data?.map(entry => ({ value: entry.category, color: CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Outros'] })) || []} 
                        onLegendClick={handleLegendClick}
                        hiddenCategories={hiddenCategories}
                    />
                </div>
            </div>
        </div>
    );
};