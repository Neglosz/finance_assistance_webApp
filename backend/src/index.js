const express = require('express');
const cors = require('cors');
require('dotenv').config();

const transactionsRoutes = require('./routes/transactions');
const installmentsRoutes = require('./routes/installments');
const savingsGoalsRoutes = require('./routes/savingsGoals');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionsRoutes);
app.use('/api/installments', installmentsRoutes);
app.use('/api/savings-goals', savingsGoalsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
