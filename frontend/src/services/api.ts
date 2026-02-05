const API_URL = import.meta.env.VITE_API_URL || '/api';

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Something went wrong');
    }

    return response.json();
}

// Dashboard API
export const dashboardAPI = {
    getStats: () => fetchAPI<import('../types').DashboardStats>('/dashboard/stats'),
    getCategories: () => fetchAPI<import('../types').Category[]>('/dashboard/categories'),
};

// Transactions API
export const transactionsAPI = {
    getAll: (params?: { type?: string; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.type) query.append('type', params.type);
        if (params?.limit) query.append('limit', params.limit.toString());
        return fetchAPI<import('../types').Transaction[]>(`/transactions?${query}`);
    },
    create: (data: import('../types').TransactionForm) =>
        fetchAPI<import('../types').Transaction>('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: string, data: Partial<import('../types').TransactionForm>) =>
        fetchAPI<import('../types').Transaction>(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    delete: (id: string) =>
        fetchAPI<{ success: boolean }>(`/transactions/${id}`, { method: 'DELETE' }),
};

// Installments API
export const installmentsAPI = {
    getAll: (params?: { status?: string }) => {
        const query = new URLSearchParams();
        if (params?.status) query.append('status', params.status);
        return fetchAPI<import('../types').Installment[]>(`/installments?${query}`);
    },
    create: (data: import('../types').InstallmentForm) =>
        fetchAPI<import('../types').Installment>('/installments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    pay: (id: string) =>
        fetchAPI<import('../types').Installment>(`/installments/${id}/pay`, { method: 'PUT' }),
    delete: (id: string) =>
        fetchAPI<{ success: boolean }>(`/installments/${id}`, { method: 'DELETE' }),
};

// Savings Goals API
export const savingsGoalsAPI = {
    getAll: () => fetchAPI<import('../types').SavingsGoal[]>('/savings-goals'),
    create: (data: import('../types').SavingsGoalForm) =>
        fetchAPI<import('../types').SavingsGoal>('/savings-goals', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    deposit: (id: string, amount: number) =>
        fetchAPI<import('../types').SavingsGoal>(`/savings-goals/${id}/deposit`, {
            method: 'PUT',
            body: JSON.stringify({ amount }),
        }),
    delete: (id: string) =>
        fetchAPI<{ success: boolean }>(`/savings-goals/${id}`, { method: 'DELETE' }),
};
