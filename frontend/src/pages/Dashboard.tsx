import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import type { DashboardStats } from '../types';

// Format currency in Thai Baht
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Format date in Thai
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
    });
};

function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await dashboardAPI.getStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bento-card">
                <div className="empty-state">
                    <div className="empty-state-icon">⚠️</div>
                    <p className="empty-state-text">{error}</p>
                    <button className="btn btn-primary mt-md" onClick={loadStats}>
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bento-grid">
            {/* Income Card */}
            <div className="bento-card stat-card-income">
                <div className="bento-card-header">
                    <span className="bento-card-title">รายรับทั้งหมด</span>
                    <span className="bento-card-icon">📈</span>
                </div>
                <div className="bento-card-value positive">
                    {formatCurrency(stats.summary.totalIncome)}
                </div>
                <p className="bento-card-subtitle">+{stats.recentTransactions.filter(t => t.type === 'income').length} รายการใหม่</p>
            </div>

            {/* Expense Card */}
            <div className="bento-card stat-card-expense">
                <div className="bento-card-header">
                    <span className="bento-card-title">รายจ่ายทั้งหมด</span>
                    <span className="bento-card-icon">📉</span>
                </div>
                <div className="bento-card-value negative">
                    {formatCurrency(stats.summary.totalExpense)}
                </div>
                <p className="bento-card-subtitle">-{stats.recentTransactions.filter(t => t.type === 'expense').length} รายการใหม่</p>
            </div>

            {/* Balance Card */}
            <div className="bento-card stat-card-balance">
                <div className="bento-card-header">
                    <span className="bento-card-title">ยอดคงเหลือ</span>
                    <span className="bento-card-icon">💰</span>
                </div>
                <div className={`bento-card-value ${stats.summary.balance >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(stats.summary.balance)}
                </div>
                <p className="bento-card-subtitle">รายรับ - รายจ่าย</p>
            </div>

            {/* Savings Progress Card */}
            <div className="bento-card stat-card-savings">
                <div className="bento-card-header">
                    <span className="bento-card-title">เงินออมรวม</span>
                    <span className="bento-card-icon">🎯</span>
                </div>
                <div className="bento-card-value" style={{ color: '#bf5af2' }}>
                    {formatCurrency(stats.summary.totalSaved)}
                </div>
                <div className="progress-bar progress-purple mt-md">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(stats.summary.savingsProgress, 100)}%` }}
                    ></div>
                </div>
                <p className="bento-card-subtitle mt-md">
                    {stats.summary.savingsProgress.toFixed(0)}% ของเป้าหมาย
                </p>
            </div>

            {/* Installments Summary */}
            <div className="bento-card span-2">
                <div className="bento-card-header">
                    <span className="bento-card-title">ผ่อนชำระ</span>
                    <span className="bento-card-icon">🛒</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                        <p className="bento-card-subtitle">รายการที่กำลังผ่อน</p>
                        <p className="bento-card-value" style={{ fontSize: '1.5rem', color: 'var(--accent-orange)' }}>
                            {stats.installments.activeCount}
                        </p>
                    </div>
                    <div>
                        <p className="bento-card-subtitle">ยอดหนี้คงเหลือ</p>
                        <p className="bento-card-value negative" style={{ fontSize: '1.5rem' }}>
                            {formatCurrency(stats.installments.totalDebt)}
                        </p>
                    </div>
                    <div>
                        <p className="bento-card-subtitle">จ่ายต่อเดือน</p>
                        <p className="bento-card-value" style={{ fontSize: '1.5rem', color: 'var(--accent-blue)' }}>
                            {formatCurrency(stats.installments.monthlyPayment)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bento-card span-2 row-span-2">
                <div className="bento-card-header">
                    <span className="bento-card-title">รายการล่าสุด</span>
                    <span className="bento-card-icon">📋</span>
                </div>

                {stats.recentTransactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p className="empty-state-text">ยังไม่มีรายการ</p>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {stats.recentTransactions.map((tx) => (
                            <div key={tx.id} className="transaction-item">
                                <div
                                    className="transaction-icon"
                                    style={{
                                        backgroundColor: tx.categories?.color ? `${tx.categories.color}20` : 'var(--glass-bg)',
                                        color: tx.categories?.color || 'var(--text-primary)'
                                    }}
                                >
                                    {tx.categories?.icon || (tx.type === 'income' ? '📥' : '📤')}
                                </div>
                                <div className="transaction-details">
                                    <p className="transaction-name">
                                        {tx.description || tx.categories?.name || 'ไม่มีรายละเอียด'}
                                    </p>
                                    <p className="transaction-date">{formatDate(tx.date)}</p>
                                </div>
                                <span className={`transaction-amount ${tx.type}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Savings Goals */}
            <div className="bento-card span-2 row-span-2">
                <div className="bento-card-header">
                    <span className="bento-card-title">เป้าหมายเงินออม</span>
                    <span className="bento-card-icon">🎯</span>
                </div>

                {stats.savingsGoals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎯</div>
                        <p className="empty-state-text">ยังไม่มีเป้าหมาย</p>
                    </div>
                ) : (
                    <>
                        {stats.savingsGoals.map((goal) => {
                            const progress = (goal.current_amount / goal.target_amount) * 100;
                            return (
                                <div key={goal.id} className="savings-goal">
                                    <div className="savings-goal-header">
                                        <span className="savings-goal-icon">{goal.icon}</span>
                                        <div className="savings-goal-info">
                                            <p className="savings-goal-name">{goal.name}</p>
                                            <p className="savings-goal-target">
                                                {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                            </p>
                                        </div>
                                        <span className="savings-goal-percentage">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="progress-bar progress-purple">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${Math.min(progress, 100)}%`,
                                                background: goal.color || 'var(--gradient-purple)'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
