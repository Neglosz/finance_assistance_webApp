import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Installments from './pages/Installments';
import Savings from './pages/Savings';

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                {/* Navigation */}
                <nav className="nav-bar">
                    <div className="nav-brand">
                        <span className="nav-brand-logo">💰</span>
                        <span className="nav-brand-text">Finance Manager</span>
                    </div>
                    <div className="nav-links">
                        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">📊</span>
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">💳</span>
                            <span>รายรับ-รายจ่าย</span>
                        </NavLink>
                        <NavLink to="/installments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">🛒</span>
                            <span>ผ่อนชำระ</span>
                        </NavLink>
                        <NavLink to="/savings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">🎯</span>
                            <span>เป้าหมาย</span>
                        </NavLink>
                    </div>
                </nav>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/installments" element={<Installments />} />
                    <Route path="/savings" element={<Savings />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
