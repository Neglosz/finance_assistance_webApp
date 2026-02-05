import { useState, useEffect } from 'react';
import { savingsGoalsAPI } from '../services/api';
import type { SavingsGoal, SavingsGoalForm } from '../types';

// Format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Format date
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'ไม่มีกำหนด';
    return new Date(dateString).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// Icon options
const iconOptions = ['🎯', '🏠', '🚗', '✈️', '💍', '📱', '💻', '🎓', '💪', '🎁', '🏖️', '🎮'];
const colorOptions = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9'];

function Savings() {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState<string | null>(null);
    const [depositAmount, setDepositAmount] = useState(0);

    const [form, setForm] = useState<SavingsGoalForm>({
        name: '',
        target_amount: 0,
        deadline: '',
        icon: '🎯',
        color: '#6366f1',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await savingsGoalsAPI.getAll();
            setGoals(data);
        } catch (error) {
            console.error('Failed to load:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await savingsGoalsAPI.create(form);
            setShowModal(false);
            setForm({
                name: '',
                target_amount: 0,
                deadline: '',
                icon: '🎯',
                color: '#6366f1',
            });
            loadData();
        } catch (error) {
            console.error('Failed to create:', error);
        }
    };

    const handleDeposit = async (id: string) => {
        if (depositAmount <= 0) return;
        try {
            await savingsGoalsAPI.deposit(id, depositAmount);
            setShowDepositModal(null);
            setDepositAmount(0);
            loadData();
        } catch (error) {
            console.error('Failed to deposit:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบเป้าหมายนี้?')) return;
        try {
            await savingsGoalsAPI.delete(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    // Calculate stats
    const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const activeGoals = goals.filter((g) => g.status === 'active');
    const completedGoals = goals.filter((g) => g.status === 'completed');

    return (
        <>
            {/* Stats Cards */}
            <div className="bento-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="bento-card stat-card-savings">
                    <div className="bento-card-header">
                        <span className="bento-card-title">เงินออมรวม</span>
                        <span className="bento-card-icon">💰</span>
                    </div>
                    <div className="bento-card-value" style={{ color: 'var(--accent-purple)' }}>
                        {formatCurrency(totalSaved)}
                    </div>
                </div>

                <div className="bento-card">
                    <div className="bento-card-header">
                        <span className="bento-card-title">เป้าหมายรวม</span>
                        <span className="bento-card-icon">🎯</span>
                    </div>
                    <div className="bento-card-value" style={{ color: 'var(--accent-blue)' }}>
                        {formatCurrency(totalTarget)}
                    </div>
                </div>

                <div className="bento-card span-2">
                    <div className="flex justify-between items-center mb-md">
                        <div>
                            <p className="bento-card-title">ความคืบหน้าโดยรวม</p>
                            <p className="bento-card-value" style={{ fontSize: '1.5rem' }}>
                                {overallProgress.toFixed(0)}%
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            ➕ เพิ่มเป้าหมาย
                        </button>
                    </div>
                    <div className="progress-bar progress-purple">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(overallProgress, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Goals List */}
            <div className="bento-grid">
                {/* Active Goals */}
                <div className="bento-card span-2 row-span-2">
                    <h3 className="mb-md">🎯 เป้าหมายที่กำลังดำเนินการ ({activeGoals.length})</h3>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : activeGoals.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🎯</div>
                            <p className="empty-state-text">ยังไม่มีเป้าหมาย</p>
                        </div>
                    ) : (
                        <>
                            {activeGoals.map((goal) => {
                                const progress = (goal.current_amount / goal.target_amount) * 100;
                                const remaining = goal.target_amount - goal.current_amount;

                                return (
                                    <div
                                        key={goal.id}
                                        className="savings-goal"
                                        style={{ borderLeft: `4px solid ${goal.color}` }}
                                    >
                                        <div className="savings-goal-header">
                                            <span className="savings-goal-icon" style={{ fontSize: '2rem' }}>
                                                {goal.icon}
                                            </span>
                                            <div className="savings-goal-info" style={{ flex: 1 }}>
                                                <p className="savings-goal-name" style={{ fontSize: '1.1rem' }}>
                                                    {goal.name}
                                                </p>
                                                <p className="savings-goal-target">
                                                    {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                                </p>
                                            </div>
                                            <div className="flex gap-sm">
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => setShowDepositModal(goal.id)}
                                                >
                                                    💵 เพิ่มเงิน
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handleDelete(goal.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between mb-md" style={{ fontSize: '0.875rem' }}>
                                            <span style={{ color: 'var(--text-tertiary)' }}>
                                                ยังขาดอีก: <span style={{ color: 'var(--accent-orange)' }}>{formatCurrency(remaining)}</span>
                                            </span>
                                            <span style={{ color: 'var(--text-tertiary)' }}>
                                                กำหนด: {formatDate(goal.deadline)}
                                            </span>
                                        </div>

                                        <div className="progress-bar">
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${Math.min(progress, 100)}%`,
                                                    background: `linear-gradient(135deg, ${goal.color} 0%, ${goal.color}aa 100%)`,
                                                }}
                                            ></div>
                                        </div>

                                        <p
                                            className="text-right mt-md"
                                            style={{ fontSize: '1.25rem', fontWeight: 700, color: goal.color }}
                                        >
                                            {progress.toFixed(0)}%
                                        </p>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Completed Goals */}
                <div className="bento-card span-2">
                    <h3 className="mb-md">✅ เป้าหมายที่สำเร็จแล้ว ({completedGoals.length})</h3>

                    {completedGoals.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                            <p className="empty-state-text">ยังไม่มีเป้าหมายที่สำเร็จ</p>
                        </div>
                    ) : (
                        <>
                            {completedGoals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className="savings-goal"
                                    style={{ background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.2)' }}
                                >
                                    <div className="savings-goal-header">
                                        <span className="savings-goal-icon">{goal.icon}</span>
                                        <div className="savings-goal-info">
                                            <p className="savings-goal-name">{goal.name}</p>
                                            <p style={{ color: 'var(--accent-green)', fontSize: '0.875rem' }}>
                                                🎉 สำเร็จแล้ว! {formatCurrency(goal.target_amount)}
                                            </p>
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleDelete(goal.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Add Goal Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">เพิ่มเป้าหมายเงินออม</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Icon */}
                            <div className="form-group">
                                <label className="form-label">ไอคอน</label>
                                <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            className={`btn ${form.icon === icon ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setForm({ ...form, icon })}
                                            style={{ fontSize: '1.5rem', padding: '8px 12px' }}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div className="form-group">
                                <label className="form-label">สี</label>
                                <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setForm({ ...form, color })}
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 'var(--radius-full)',
                                                background: color,
                                                border: form.color === color ? '3px solid white' : '3px solid transparent',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label">ชื่อเป้าหมาย</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="เช่น ซื้อ iPhone ใหม่"
                                    required
                                />
                            </div>

                            {/* Target Amount */}
                            <div className="form-group">
                                <label className="form-label">จำนวนเงินเป้าหมาย (บาท)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.target_amount || ''}
                                    onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })}
                                    placeholder="50000"
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Deadline */}
                            <div className="form-group">
                                <label className="form-label">กำหนดวัน (ไม่บังคับ)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={form.deadline}
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    สร้างเป้าหมาย
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="modal-overlay" onClick={() => setShowDepositModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">เพิ่มเงินเข้าเป้าหมาย</h3>
                            <button className="modal-close" onClick={() => setShowDepositModal(null)}>
                                ✕
                            </button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">จำนวนเงิน (บาท)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={depositAmount || ''}
                                onChange={(e) => setDepositAmount(Number(e.target.value))}
                                placeholder="1000"
                                min="1"
                            />
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowDepositModal(null)}>
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => handleDeposit(showDepositModal)}
                            >
                                เพิ่มเงิน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Savings;
