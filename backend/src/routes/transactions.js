const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const { type, category_id, limit = 50, offset = 0 } = req.query;

        let query = supabase
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (type) query = query.eq('type', type);
        if (category_id) query = query.eq('category_id', category_id);

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create transaction
router.post('/', async (req, res) => {
    try {
        const { amount, type, category_id, description, date } = req.body;

        const { data, error } = await supabase
            .from('transactions')
            .insert([{ amount, type, category_id, description, date: date || new Date().toISOString() }])
            .select('*, categories(*)')
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single transaction
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('transactions')
            .select('*, categories(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, category_id, description, date } = req.body;

        const { data, error } = await supabase
            .from('transactions')
            .update({ amount, type, category_id, description, date })
            .eq('id', id)
            .select('*, categories(*)')
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
