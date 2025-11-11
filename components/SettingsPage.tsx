import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, SpendingAlert } from '../types';
import { updateUserProfile, getUserProfile } from '../services/dataService';

interface SettingsPageProps {
    profile: UserProfile;
    onProfileChange: (profile: UserProfile) => void;
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    onClearData: () => void;
    spendingCategories: string[];
    alerts: SpendingAlert[];
    onAlertsChange: (alerts: SpendingAlert[]) => void;
}

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">{title}</h3>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{description}</p>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full h-10 px-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full h-10 px-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}>
       {props.children}
   </select>
);


export const SettingsPage: React.FC<SettingsPageProps> = ({ profile, onProfileChange, theme, onThemeChange, onClearData, spendingCategories, alerts, onAlertsChange }) => {
    const [localProfile, setLocalProfile] = useState(profile);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isAddingAlert, setIsAddingAlert] = useState(false);
    const [newAlertCategory, setNewAlertCategory] = useState(spendingCategories[0] || '');
    const [newAlertLimit, setNewAlertLimit] = useState('');
    
    const operationalCategories = spendingCategories.filter(c => c !== 'Investimentos' && c !== 'Renda');

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    useEffect(() => {
        if (spendingCategories.length > 0 && !newAlertCategory) {
            setNewAlertCategory(operationalCategories[0] || '');
        }
    }, [spendingCategories, newAlertCategory, operationalCategories]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalProfile(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await updateUserProfile(localProfile);
            if (success) {
                // Recarregar o perfil do banco de dados
                const updatedProfile = await getUserProfile();
                if (updatedProfile) {
                    onProfileChange(updatedProfile);
                    setLocalProfile(updatedProfile);
                } else {
                    onProfileChange(localProfile);
                }
                alert('✅ Perfil salvo com sucesso!');
            } else {
                alert('❌ Erro ao salvar perfil. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            alert('❌ Erro ao salvar perfil. Verifique o console.');
        }
    };
    
    const handleClearDataConfirm = () => {
        onClearData();
        setIsModalOpen(false);
    };
    
    const handleAddAlert = () => {
        const limitNumber = parseFloat(newAlertLimit);
        if (!newAlertCategory || isNaN(limitNumber) || limitNumber <= 0) {
            alert('Por favor, selecione uma categoria e insira um limite válido.');
            return;
        }

        const newAlert: SpendingAlert = {
            id: Date.now().toString(),
            category: newAlertCategory,
            limit: limitNumber,
        };

        onAlertsChange([...alerts, newAlert]);
        setNewAlertLimit('');
        setNewAlertCategory(operationalCategories[0] || '');
        setIsAddingAlert(false);
    };

    const handleRemoveAlert = (idToRemove: string) => {
        onAlertsChange(alerts.filter(alert => alert.id !== idToRemove));
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">Configurações</h1>
                <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">Gerencie seu perfil, aparência e dados da aplicação.</p>
            </header>

            <div className="space-y-8 max-w-3xl mx-auto">
                <SettingsCard title="Perfil" description="Atualize seu nome, e-mail e foto de perfil.">
                    <form className="space-y-4" onSubmit={handleProfileSave}>
                        <div className="flex items-center gap-5">
                            <img src={localProfile.imageUrl} alt="Foto de Perfil" className="size-16 rounded-full object-cover" />
                            <div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-primary hover:underline">
                                    Alterar foto
                                </button>
                                <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">JPG, GIF ou PNG.</p>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" type="text" value={localProfile.name} onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={localProfile.email} onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })} />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </SettingsCard>
                
                <SettingsCard title="Aparência" description="Personalize a aparência da aplicação.">
                    <div className="flex items-center justify-between">
                         <p className="text-sm font-medium text-text-light dark:text-text-dark">Modo Escuro</p>
                         <button onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </SettingsCard>

                <SettingsCard title="Alertas de Gastos" description="Configure alertas para ser notificado quando seus gastos em uma categoria excederem um valor.">
                    <div className="space-y-3">
                        {alerts.length === 0 && !isAddingAlert && (
                            <p className="text-sm text-center text-text-muted-light dark:text-text-muted-dark py-4">Nenhum alerta configurado.</p>
                        )}
                        {alerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg">
                                <div>
                                    <p className="font-medium text-text-light dark:text-text-dark">{alert.category}</p>
                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Limite: {formatCurrency(alert.limit)}</p>
                                </div>
                                <button onClick={() => handleRemoveAlert(alert.id)} className="text-danger hover:bg-danger/10 p-2 rounded-full transition-colors">
                                    <span className="material-symbols-outlined" style={{fontSize: '20px'}}>delete</span>
                                </button>
                            </div>
                        ))}
                        {isAddingAlert && (
                            <div className="p-4 border border-border-light dark:border-border-dark rounded-lg space-y-3">
                                <h4 className="font-medium text-text-light dark:text-text-dark">Novo Alerta</h4>
                                <div>
                                    <Label htmlFor="alert-category">Categoria</Label>
                                    <Select id="alert-category" value={newAlertCategory} onChange={e => setNewAlertCategory(e.target.value)}>
                                        {operationalCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </Select>
                                </div>
                                 <div>
                                    <Label htmlFor="alert-limit">Limite (R$)</Label>
                                    <Input id="alert-limit" type="number" placeholder="ex: 500.00" value={newAlertLimit} onChange={e => setNewAlertLimit(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setIsAddingAlert(false)} className="h-9 px-3 rounded-lg text-sm font-semibold text-text-muted-light dark:text-text-muted-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                        Cancelar
                                    </button>
                                     <button onClick={handleAddAlert} className="h-9 px-3 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">
                                        Salvar Alerta
                                    </button>
                                </div>
                            </div>
                        )}
                        {!isAddingAlert && (
                             <button onClick={() => setIsAddingAlert(true)} className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 border-2 border-dashed border-border-light dark:border-border-dark text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
                                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>add</span>
                                Adicionar Alerta
                            </button>
                        )}
                    </div>
                </SettingsCard>

                <SettingsCard title="Dados" description="Gerencie os dados do seu extrato.">
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-text-light dark:text-text-dark">Limpar Dados do Extrato</p>
                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Isso removerá todas as transações e análises atuais.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-danger/10 text-danger text-sm font-semibold hover:bg-danger/20 transition-colors">
                            Limpar Dados
                        </button>
                    </div>
                </SettingsCard>
            </div>
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" aria-modal="true" role="dialog">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
                        <h2 className="text-lg font-bold text-text-light dark:text-text-dark">Confirmar Ação</h2>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-2 mb-6">
                            Você tem certeza que deseja limpar todos os dados do extrato? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-4">
                             <button onClick={() => setIsModalOpen(false)} className="h-10 px-4 rounded-lg text-sm font-semibold text-text-muted-light dark:text-text-muted-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleClearDataConfirm} className="h-10 px-4 rounded-lg text-sm font-semibold bg-danger text-white hover:bg-danger/90 transition-colors">
                                Sim, Limpar
                            </button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};