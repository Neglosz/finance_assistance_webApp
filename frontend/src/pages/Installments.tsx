import { useState, useEffect } from 'react';
import { installmentsAPI } from '../services/api';
import type { Installment, InstallmentForm } from '../types';

// Format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Get platform info
const getPlatformInfo = (platform: string) => {
    const platforms: Record<string, { icon: string; name: string; color: string }> = {
        shopee: { icon: '🛒', name: 'Shopee', color: '#ee4d2d' },
        lazada: { icon: '🛍️', name: 'Lazada', color: '#0f1470' },
        credit_card: { icon: '💳', name: 'บัตรเครดิต', color: '#1a1a2e' },
        other: { icon: '📦', name: 'อื่นๆ', color: '#6366f1' },
    };
    return platforms[platform] || platforms.other;
};

function Installments() {
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const [form, setForm] = useState<InstallmentForm>({
        name: '',
        platform: 'shopee',
        total_amount: 0,
        monthly_payment: 0,
        total_months: 1,
        start_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await installmentsAPI.getAll({
                status: filter === 'all' ? undefined : filter,
            });
            setInstallments(data);
        } catch (error) {
            console.error('Failed to load:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await installmentsAPI.create(form);
            setShowModal(false);
            setForm({
                name: '',
                platform: 'shopee',
                total_amount: 0,
                monthly_payment: 0,
                total_months: 1,
                start_date: new Date().toISOString().split('T')[0],
            });
            loadData();
        } catch (error) {
            console.error('Failed to create:', error);
        }
    };

    const handlePay = async (id: string) => {
        try {
            await installmentsAPI.pay(id);
            loadData();
        } catch (error) {
            console.error('Failed to pay:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบรายการนี้?')) return;
        try {
            await installmentsAPI.delete(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    // Calculate stats
    const activeInstallments = installments.filter((i) => i.status === 'active');
    const totalDebt = activeInstallments.reduce((sum, i) => {
        const remaining = i.total_months - i.paid_months;
        return sum + remaining * i.monthly_payment;
    }, 0);
    const monthlyPayment = activeInstallments.reduce((sum, i) => sum + i.monthly_payment, 0);

    return (
        <>
            {/* Stats Cards */}
            <div className="bento-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="bento-card">
                    <div className="bento-card-header">
                        <span className="bento-card-title">รายการที่กำลังผ่อน</span>
                        <span className="bento-card-icon">📦</span>
                    </div>
                    <div className="bento-card-value" style={{ color: 'var(--accent-orange)' }}>
                        {activeInstallments.length}
                    </div>
                </div>

                <div className="bento-card">
                    <div className="bento-card-header">
                        <span className="bento-card-title">ยอดหนี้คงเหลือ</span>
                        <span className="bento-card-icon">💸</span>
                    </div>
                    <div className="bento-card-value negative">{formatCurrency(totalDebt)}</div>
                </div>

                <div className="bento-card span-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="bento-card-title">ต้องจ่ายต่อเดือน</p>
                            <p className="bento-card-value" style={{ color: 'var(--accent-blue)' }}>
                                {formatCurrency(monthlyPayment)}
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            ➕ เพิ่มรายการผ่อน
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter & List */}
            <div className="bento-card">
                <div className="flex justify-between items-center mb-md">
                    <h3>รายการผ่อนชำระ</h3>
                    <div className="flex gap-sm">
                        {(['all', 'active', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'ทั้งหมด' : f === 'active' ? 'กำลังผ่อน' : 'ผ่อนจบแล้ว'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : installments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <p className="empty-state-text">ยังไม่มีรายการผ่อน</p>
                    </div>
                ) : (
                    <>
                        {installments.map((inst) => {
                            const platform = getPlatformInfo(inst.platform);
                            const progress = (inst.paid_months / inst.total_months) * 100;
                            const remainingAmount = (inst.total_months - inst.paid_months) * inst.monthly_payment;

                            return (
                                <div key={inst.id} className="installment-item">
                                    <div className="installment-header">
                                        <div className="installment-info">
                                            <span className="installment-platform">{platform.icon}</span>
                                            <div>
                                                <p className="installment-name">{inst.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    {platform.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-sm items-center">
                                            {inst.status === 'active' && (
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handlePay(inst.id)}
                                                >
                                                    💵 จ่ายงวด
                                                </button>
                                            )}
                                            <span
                                                className="installment-status"
                                                style={{
                                                    background:
                                                        inst.status === 'completed'
                                                            ? 'rgba(48, 209, 88, 0.2)'
                                                            : 'rgba(255, 159, 10, 0.2)',
                                                    color: inst.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-orange)',
                                                }}
                                            >
                                                {inst.status === 'completed' ? '✅ ผ่อนจบแล้ว' : `📅 งวด ${inst.paid_months}/${inst.total_months}`}
                                            </span>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleDelete(inst.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    <div className="installment-progress-info">
                                        <span>
                                            จ่ายไปแล้ว: <span className="installment-amount">{formatCurrency(inst.paid_months * inst.monthly_payment)}</span>
                                        </span>
                                        <span>
                                            คงเหลือ: <span className="installment-amount">{formatCurrency(remainingAmount)}</span>
                                        </span>
                                    </div>

                                    <div className="progress-bar progress-orange">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>

                                    <div
                                        className="flex justify-between mt-md"
                                        style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}
                                    >
                                        <span>ยอดรวม: {formatCurrency(inst.total_amount)}</span>
                                        <span>เดือนละ: {formatCurrency(inst.monthly_payment)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">เพิ่มรายการผ่อน</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label">ชื่อสินค้า/รายการ</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="เช่น iPhone 15 Pro"
                                    required
                                />
                            </div>

                            {/* Platform */}
                            <div className="form-group">
                                <label className="form-label">แพลตฟอร์ม</label>
                                <select
                                    className="form-select"
                                    value={form.platform}
                                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                                >
                                    <option value="shopee">🛒 Shopee</option>
                                    <option value="lazada">🛍️ Lazada</option>
                                    <option value="credit_card">💳 บัตรเครดิต</option>
                                    <option value="other">📦 อื่นๆ</option>
                                </select>
                            </div>

                            {/* Total Amount */}
                            <div className="form-group">
                                <label className="form-label">ราคาสินค้ารวม (บาท)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.total_amount || ''}
                                    onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })}
                                    placeholder="0"
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Monthly Payment */}
                            <div className="form-group">
                                <label className="form-label">ค่างวดต่อเดือน (บาท)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.monthly_payment || ''}
                                    onChange={(e) => setForm({ ...form, monthly_payment: Number(e.target.value) })}
                                    placeholder="0"
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Total Months */}
                            <div className="form-group">
                                <label className="form-label">จำนวนงวด</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.total_months || ''}
                                    onChange={(e) => setForm({ ...form, total_months: Number(e.target.value) })}
                                    placeholder="10"
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Start Date */}
                            <div className="form-group">
                                <label className="form-label">วันที่เริ่มผ่อน</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
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

export default Installments;
