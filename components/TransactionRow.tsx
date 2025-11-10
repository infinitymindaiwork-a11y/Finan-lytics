import React from 'react';
import type { Transaction } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface TransactionRowProps {
    transaction: Transaction;
    categories: string[];
    onUpdateTransaction: (transaction: Transaction) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, categories, onUpdateTransaction }) => {
    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? 'text-success' : 'text-text-light dark:text-text-dark';
    const amountPrefix = isIncome ? '+' : '';
    const categoryColor = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS['Outros'];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryValue = e.target.value;
        if (newCategoryValue === '--add-new--') {
            const newCustomCategory = window.prompt("Digite o nome da nova categoria:");
            if (newCustomCategory && newCustomCategory.trim() !== "") {
                if (categories.map(c => c.toLowerCase()).includes(newCustomCategory.trim().toLowerCase())) {
                    alert("Essa categoria já existe.");
                    onUpdateTransaction({ ...transaction, category: categories.find(c => c.toLowerCase() === newCustomCategory.trim().toLowerCase()) || transaction.category });
                    return;
                }
                onUpdateTransaction({ ...transaction, category: newCustomCategory.trim() });
            }
        } else {
            onUpdateTransaction({ ...transaction, category: newCategoryValue });
        }
    };

    return (
        <tr className="border-b border-border-light dark:border-border-dark last:border-b-0 group">
            <td className="p-4 text-sm text-text-muted-light dark:text-text-muted-dark whitespace-nowrap">{transaction.date}</td>
            <td className="p-4 text-sm font-medium text-text-light dark:text-text-dark">{transaction.description}</td>
            <td className="p-4 text-sm">
                <div className="inline-block relative">
                    <select
                        value={transaction.category}
                        onChange={handleCategoryChange}
                        className="appearance-none cursor-pointer bg-transparent border-none text-xs font-medium rounded-full px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ 
                            backgroundColor: `${categoryColor}20`, 
                            color: categoryColor,
                            minWidth: '100px'
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat} className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                {cat}
                            </option>
                        ))}
                        <option value="--add-new--" className="font-bold text-primary bg-card-light dark:bg-card-dark">
                            + Adicionar Nova...
                        </option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1" style={{ color: categoryColor }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>expand_more</span>
                    </div>
                </div>
            </td>
            <td className={`p-4 text-sm font-medium text-right ${amountColor}`}>{amountPrefix}{formatCurrency(transaction.amount)}</td>
        </tr>
    );
};