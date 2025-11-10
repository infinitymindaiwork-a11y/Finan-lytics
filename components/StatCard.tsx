import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
        <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark min-h-[120px]">
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal">{title}</p>
            <p className="text-text-light dark:text-text-dark tracking-tight text-3xl font-bold leading-tight">{value}</p>
        </div>
    );
};