const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all savings goals
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;

        let query = supabase
            .from('savings_goals')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create savings goal
router.post('/', async (req, res) => {
    try {
        const { name, target_amount, deadline, icon, color } = req.body;

        const { data, error } = await supabase
            .from('savings_goals')
            .insert([{
                name,
                target_amount,
                current_amount: 0,
                deadline,
                icon: icon || '🎯',
                color: color || '#6366f1',
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single savings goal
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update savings goal
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const { data, error } = await supabase
            .from('savings_goals')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deposit to savings goal
router.put('/:id/deposit', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        // Get current goal
        const { data: goal, error: fetchError } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const newAmount = goal.current_amount + amount;
        const newStatus = newAmount >= goal.target_amount ? 'completed' : 'active';

        const { data, error } = await supabase
            .from('savings_goals')
            .update({ current_amount: newAmount, status: newStatus })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete savings goal
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('savings_goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
