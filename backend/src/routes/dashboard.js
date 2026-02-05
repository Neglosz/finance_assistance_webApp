const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get transactions summary
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('amount, type');

        if (txError) throw txError;

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Get active installments
        const { data: installments, error: instError } = await supabase
            .from('installments')
            .select('*')
            .eq('status', 'active');

        if (instError) throw instError;

        const totalInstallmentDebt = installments.reduce((sum, inst) => {
            const remaining = inst.total_months - inst.paid_months;
            return sum + (remaining * inst.monthly_payment);
        }, 0);

        const monthlyInstallmentPayment = installments.reduce((sum, inst) => {
            return sum + Number(inst.monthly_payment);
        }, 0);

        // Get savings goals
        const { data: savingsGoals, error: savingsError } = await supabase
            .from('savings_goals')
            .select('*');

        if (savingsError) throw savingsError;

        const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);
        const totalGoalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);

        // Get recent transactions
        const { data: recentTransactions, error: recentError } = await supabase
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: false })
            .limit(5);

        if (recentError) throw recentError;

        res.json({
            summary: {
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                totalSaved,
                totalGoalTarget,
                savingsProgress: totalGoalTarget > 0 ? (totalSaved / totalGoalTarget) * 100 : 0
            },
            installments: {
                activeCount: installments.length,
                totalDebt: totalInstallmentDebt,
                monthlyPayment: monthlyInstallmentPayment
            },
            recentTransactions,
            savingsGoals: savingsGoals.slice(0, 3)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get categories
router.get('/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
