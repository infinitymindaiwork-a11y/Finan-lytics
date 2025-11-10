import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionRow } from './TransactionRow';
import { SkeletonRow } from './SkeletonRow';

interface TransactionsPageProps {
    transactions: Transaction[] | undefined;
    isLoading: boolean;
    categories: string[];
    onUpdateTransaction: (transaction: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, isLoading, categories, onUpdateTransaction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');

    const availableCategories = useMemo(() => {
        return ['all', ...categories];
    }, [categories]);

    // Get available months from transactions
    const availableMonths = useMemo(() => {
        if (!transactions) return [];
        const monthsSet = new Set<string>();
        transactions.forEach(t => {
            const parts = t.date.toLowerCase().split(' de ');
            if (parts.length === 3) {
                const month = parts[1];
                const year = parts[2];
                monthsSet.add(`${month}/${year}`);
            }
        });
        return ['all', ...Array.from(monthsSet).sort((a, b) => {
            if (a === 'all') return -1;
            if (b === 'all') return 1;
            const [monthA, yearA] = a.split('/');
            const [monthB, yearB] = b.split('/');
            const months: { [key: string]: number } = {
                'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
                'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
            };
            if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
            return months[monthB] - months[monthA];
        })];
    }, [transactions]);

    // Helper to parse Brazilian Portuguese dates
    const parsePtBrDate = (dateString: string): Date => {
        const months: { [key: string]: number } = {
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
            'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
        };
        const parts = dateString.toLowerCase().split(' de ');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = months[parts[1]];
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                return new Date(year, month, day);
            }
        }
        return new Date(dateString);
    };

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
            const matchesType = selectedType === 'all' || t.type === selectedType;
            
            // Month filtering
            let matchesMonth = true;
            if (selectedMonth !== 'all') {
                const parts = t.date.toLowerCase().split(' de ');
                if (parts.length === 3) {
                    const monthYear = `${parts[1]}/${parts[2]}`;
                    matchesMonth = monthYear === selectedMonth;
                }
            }
            
            return matchesSearch && matchesCategory && matchesType && matchesMonth;
        });
    }, [transactions, searchTerm, selectedCategory, selectedType, selectedMonth]);

    const FilterInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
        <input {...props} className="w-full h-10 px-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    );

    const FilterSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
         <select {...props} className="w-full h-10 px-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}>
            {props.children}
        </select>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">Transações</h1>
                <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">Revise, pesquise e filtre todas as suas transações.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
                <FilterInput
                    type="text"
                    placeholder="Pesquisar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FilterSelect value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat === 'all' ? 'Todas as Categorias' : cat}</option>
                    ))}
                </FilterSelect>
                <FilterSelect value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="all">Todos os Tipos</option>
                    <option value="expense">Despesa</option>
                    <option value="income">Renda</option>
                </FilterSelect>
                <FilterSelect value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="all">Todos os Meses</option>
                    {availableMonths.filter(m => m !== 'all').map(month => {
                        const [monthName, year] = month.split('/');
                        const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                        return (
                            <option key={month} value={month}>
                                {monthCapitalized} {year}
                            </option>
                        );
                    })}
                </FilterSelect>
            </div>

            <section className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border-light dark:border-border-dark">
                             <tr>
                                <th className="p-4 text-sm font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Data</th>
                                <th className="p-4 text-sm font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Descrição</th>
                                <th className="p-4 text-sm font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Categoria</th>
                                <th className="p-4 text-sm font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, index) => <SkeletonRow key={index} />)
                            ) : (
                                filteredTransactions?.map((tx) => (
                                    <TransactionRow 
                                        key={tx.id} 
                                        transaction={tx}
                                        categories={categories}
                                        onUpdateTransaction={onUpdateTransaction}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                 {filteredTransactions && filteredTransactions.length === 0 && !isLoading && (
                    <div className="text-center p-8 text-text-muted-light dark:text-text-muted-dark">
                        <p>Nenhuma transação encontrada com os filtros atuais.</p>
                    </div>
                )}
            </section>
        </div>
    );
};