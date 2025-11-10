import React from 'react';

interface HeaderProps {
    onUploadClick: () => void;
    months: string[];
    selectedMonth: string;
    onMonthChange: (month: string) => void;
    userName: string;
}

const FilterSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full h-10 px-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}>
       {props.children}
   </select>
);


export const Header: React.FC<HeaderProps> = ({ onUploadClick, months, selectedMonth, onMonthChange, userName }) => {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">Bem-vinda de volta, {userName.split(' ')[0]}</h1>
                <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">Aqui está sua visão geral financeira com tecnologia de IA.</p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="w-48">
                     <label htmlFor="month-filter" className="sr-only">Filtrar por mês</label>
                     <FilterSelect 
                         id="month-filter"
                         value={selectedMonth}
                         onChange={(e) => onMonthChange(e.target.value)}
                     >
                         {months.map(month => (
                             <option key={month} value={month}>
                                 {month === 'all' ? 'Todos os Meses' : month}
                             </option>
                         ))}
                     </FilterSelect>
                 </div>
                <button
                    onClick={onUploadClick}
                    className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal shadow-sm hover:bg-primary/90 transition-colors"
                    title="Adicionar outro extrato bancário"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                    <span className="truncate">Adicionar Extrato</span>
                </button>
            </div>
        </header>
    );
};
