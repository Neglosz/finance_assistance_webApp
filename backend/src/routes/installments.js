const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all installments
router.get('/', async (req, res) => {
    try {
        const { status, platform } = req.query;

        let query = supabase
            .from('installments')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (platform) query = query.eq('platform', platform);

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create installment
router.post('/', async (req, res) => {
    try {
        const { name, platform, total_amount, monthly_payment, total_months, start_date } = req.body;

        const { data, error } = await supabase
            .from('installments')
            .insert([{
                name,
                platform,
                total_amount,
                monthly_payment,
                total_months,
                paid_months: 0,
                start_date: start_date || new Date().toISOString(),
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

// Get single installment
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('installments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update installment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const { data, error } = await supabase
            .from('installments')
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

// Pay installment (increment paid_months)
router.put('/:id/pay', async (req, res) => {
    try {
        const { id } = req.params;

        // Get current installment
        const { data: installment, error: fetchError } = await supabase
            .from('installments')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const newPaidMonths = installment.paid_months + 1;
        const newStatus = newPaidMonths >= installment.total_months ? 'completed' : 'active';

        const { data, error } = await supabase
            .from('installments')
            .update({ paid_months: newPaidMonths, status: newStatus })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete installment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('installments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
