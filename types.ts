
export interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
}

export interface SpendingBreakdown {
    category: string;
    amount: number;
}

export interface MonthlyOverview {
    month: string;
    income: number;
    expense: number;
    investments: number;
}

export interface Summary {
    totalBalance: number;
    monthlyIncome: number;

    monthlyExpenses: number;
    monthlyInvestments: number;
    netSavings: number;
}

export interface AnalysisData {
    summary: Summary;
    transactions: Transaction[];
    spendingBreakdown: SpendingBreakdown[];
    monthlyOverview: MonthlyOverview[];
}

export type View = 'dashboard' | 'transactions' | 'reports' | 'settings';

export interface UserProfile {
    name: string;
    email: string;
    imageUrl?: string;
}

export interface SpendingAlert {
    id: string;
    category: string;
    limit: number;
}