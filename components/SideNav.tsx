import React from 'react';
import type { View, UserProfile } from '../types';

interface NavLinkProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick }) => {
    const activeClasses = "bg-primary/10 dark:bg-primary/20 text-primary";
    const inactiveClasses = "text-text-muted-light dark:text-text-muted-dark hover:bg-zinc-100 dark:hover:bg-zinc-800";
    const textWeight = isActive ? "font-semibold" : "font-medium";

    return (
        <button onClick={onClick} className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${isActive ? activeClasses : inactiveClasses}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <p className={`text-sm leading-normal ${textWeight}`}>{label}</p>
        </button>
    );
};

interface SideNavProps {
    currentView: View;
    onNavigate: (view: View) => void;
    userProfile: UserProfile;
    onLogout: () => void;
}


export const SideNav: React.FC<SideNavProps> = ({ currentView, onNavigate, userProfile, onLogout }) => {
    return (
        <aside className="hidden md:flex w-64 flex-col justify-between bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark p-4">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="text-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>query_stats</span>
                    </div>
                    <h1 className="text-text-light dark:text-text-dark text-xl font-bold leading-normal">Finan-lytics</h1>
                </div>
                <nav className="flex flex-col gap-2">
                    <NavLink icon="dashboard" label="Painel" isActive={currentView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                    <NavLink icon="receipt_long" label="Transações" isActive={currentView === 'transactions'} onClick={() => onNavigate('transactions')} />
                    <NavLink icon="bar_chart" label="Relatórios" isActive={currentView === 'reports'} onClick={() => onNavigate('reports')} />
                    <NavLink icon="settings" label="Configurações" isActive={currentView === 'settings'} onClick={() => onNavigate('settings')} />
                </nav>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-2">
                    <img src={userProfile.imageUrl} alt="Foto de Perfil" className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 object-cover" />
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal truncate">{userProfile.name}</p>
                        <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-normal leading-normal truncate">{userProfile.email}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2 text-text-muted-light dark:text-text-muted-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                    <p className="text-sm font-medium leading-normal">Sair</p>
                </button>
            </div>
        </aside>
    );
};
