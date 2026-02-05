import { useState, useEffect } from 'react';
import { transactionsAPI, dashboardAPI } from '../services/api';
import type { Transaction, Category, TransactionForm } from '../types';

// Format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    const [form, setForm] = useState<TransactionForm>({
        amount: 0,
        type: 'expense',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [txData, catData] = await Promise.all([
                transactionsAPI.getAll({ type: filter === 'all' ? undefined : filter }),
                dashboardAPI.getCategories(),
            ]);
            setTransactions(txData);
            setCategories(catData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await transactionsAPI.create(form);
            setShowModal(false);
            setForm({
                amount: 0,
                type: 'expense',
                category_id: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
            loadData();
        } catch (error) {
            console.error('Failed to create transaction:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบรายการนี้?')) return;
        try {
            await transactionsAPI.delete(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const filteredCategories = categories.filter((c) => c.type === form.type);

    // Calculate totals
    const totals = transactions.reduce(
        (acc, tx) => {
            if (tx.type === 'income') acc.income += Number(tx.amount);
            else acc.expense += Number(tx.amount);
            return acc;
        },
        { income: 0, expense: 0 }
    );

    return (
        <>
            {/* Header Stats */}
            <div className="bento-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="bento-card stat-card-income">
                    <div className="bento-card-header">
                        <span className="bento-card-title">รายรับ</span>
                        <span className="bento-card-icon">📈</span>
                    </div>
                    <div className="bento-card-value positive">{formatCurrency(totals.income)}</div>
                </div>

                <div className="bento-card stat-card-expense">
                    <div className="bento-card-header">
                        <span className="bento-card-title">รายจ่าย</span>
                        <span className="bento-card-icon">📉</span>
                    </div>
                    <div className="bento-card-value negative">{formatCurrency(totals.expense)}</div>
                </div>

                <div className="bento-card span-2">
                    <div className="flex justify-between items-center">
                        <h2>รายการทั้งหมด</h2>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            ➕ เพิ่มรายการ
                        </button>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-sm mt-md">
                        {(['all', 'income', 'expense'] as const).map((f) => (
                            <button
                                key={f}
                                className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'ทั้งหมด' : f === 'income' ? 'รายรับ' : 'รายจ่าย'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bento-card">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p className="empty-state-text">ยังไม่มีรายการ</p>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="transaction-item">
                                <div
                                    className="transaction-icon"
                                    style={{
                                        backgroundColor: tx.categories?.color
                                            ? `${tx.categories.color}20`
                                            : 'var(--glass-bg)',
                                        color: tx.categories?.color || 'var(--text-primary)',
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
                                    {tx.type === 'income' ? '+' : '-'}
                                    {formatCurrency(tx.amount)}
                                </span>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleDelete(tx.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">เพิ่มรายการ</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Type Toggle */}
                            <div className="form-group">
                                <label className="form-label">ประเภท</label>
                                <div className="flex gap-sm">
                                    <button
                                        type="button"
                                        className={`btn ${form.type === 'income' ? 'btn-success' : 'btn-ghost'}`}
                                        onClick={() => setForm({ ...form, type: 'income', category_id: '' })}
                                    >
                                        📈 รายรับ
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${form.type === 'expense' ? 'btn-danger' : 'btn-ghost'}`}
                                        onClick={() => setForm({ ...form, type: 'expense', category_id: '' })}
                                    >
                                        📉 รายจ่าย
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="form-group">
                                <label className="form-label">จำนวนเงิน (บาท)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.amount || ''}
                                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                                    placeholder="0"
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Category */}
                            <div className="form-group">
                                <label className="form-label">หมวดหมู่</label>
                                <select
                                    className="form-select"
                                    value={form.category_id}
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                    required
                                >
                                    <option value="">เลือกหมวดหมู่</option>
                                    {filteredCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label">รายละเอียด (ไม่บังคับ)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="รายละเอียดเพิ่มเติม..."
                                />
                            </div>

                            {/* Date */}
                            <div className="form-group">
                                <label className="form-label">วันที่</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Transactions;
