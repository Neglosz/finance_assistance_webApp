// Category type
export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    created_at: string;
}

// Transaction type
export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category_id: string | null;
    categories?: Category;
    description: string | null;
    date: string;
    created_at: string;
}

// Installment type
export interface Installment {
    id: string;
    name: string;
    platform: 'shopee' | 'lazada' | 'credit_card' | 'other';
    total_amount: number;
    monthly_payment: number;
    total_months: number;
    paid_months: number;
    start_date: string;
    status: 'active' | 'completed' | 'cancelled';
    created_at: string;
}

// Savings Goal type
export interface SavingsGoal {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    icon: string;
    color: string;
    status: 'active' | 'completed';
    created_at: string;
}

// Dashboard Stats type
export interface DashboardStats {
    summary: {
        totalIncome: number;
        totalExpense: number;
        balance: number;
        totalSaved: number;
        totalGoalTarget: number;
        savingsProgress: number;
    };
    installments: {
        activeCount: number;
        totalDebt: number;
        monthlyPayment: number;
    };
    recentTransactions: Transaction[];
    savingsGoals: SavingsGoal[];
}

// Form types
export interface TransactionForm {
    amount: number;
    type: 'income' | 'expense';
    category_id: string;
    description: string;
    date: string;
}

export interface InstallmentForm {
    name: string;
    platform: string;
    total_amount: number;
    monthly_payment: number;
    total_months: number;
    start_date: string;
}

export interface SavingsGoalForm {
    name: string;
    target_amount: number;
    deadline: string;
    icon: string;
    color: string;
}
