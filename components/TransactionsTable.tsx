import React from 'react';
import type { Transaction } from '../types';
import { TransactionRow } from './TransactionRow';
import { SkeletonRow } from './SkeletonRow';

interface TransactionsTableProps {
    transactions: Transaction[] | undefined;
    isLoading: boolean;
    title?: string;
    categories: string[];
    onUpdateTransaction: (transaction: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, isLoading, title = "Transações Recentes", categories, onUpdateTransaction }) => {
    return (
        <section className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
            <h2 className="text-text-light dark:text-text-dark text-lg font-semibold leading-tight tracking-tight p-6">{title}</h2>
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
                            Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
                        ) : (
                            transactions?.slice(0, 10).map((tx) => (
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
             {transactions && transactions.length === 0 && !isLoading && (
                <div className="text-center p-8 text-text-muted-light dark:text-text-muted-dark">
                    <p>Nenhuma transação encontrada neste período.</p>
                </div>
            )}
        </section>
    );
};