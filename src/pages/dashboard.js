import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { listUsersAdmin } from '../services/apiService';
import Navbar from '../components/Navbar';
import { AuthController } from '../controllers/AuthController';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORS = ['#FF8042', '#FFD700'];

export default function Dashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({ total: 0, premium: 0, free: 0 });
    const [signupData, setSignupData] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!AuthController.isAuthenticated()) {
            router.replace('/');
            return;
        }

        const fetchData = async () => {
            try {
                const userRes = await listUsersAdmin(1, 1000, '');
                const allUsers = userRes.users || [];

                // Only user and guardian accounts (exclude admin)
                const filtered = allUsers.filter(
                    u => u.userType?.toLowerCase() === 'user' || u.userType?.toLowerCase() === 'guardian'
                );

                setUsers(filtered);

                // Premium vs Free
                const premium = filtered.filter(u => u.isPremiumUser || u.subscriptionType === 'Premium').length;
                const free = filtered.length - premium;
                setUserStats({ total: filtered.length, premium, free });

                // Online = active within last 5 minutes
                const now = new Date();
                const online = filtered.filter(u => {
                    const last = new Date(u.lastActiveAt);
                    return (now - last) / 1000 < 300;
                }).length;
                setOnlineCount(online);

                // Signup bar graph data (last 7 days)
                const today = new Date();
                const dailyCounts = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() - (6 - i));
                    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    const count = filtered.filter(u => {
                        const created = new Date(u.createdAt);
                        return (
                            created.getFullYear() === date.getFullYear() &&
                            created.getMonth() === date.getMonth() &&
                            created.getDate() === date.getDate()
                        );
                    }).length;

                    return { date: label, accounts: count };
                });

                setSignupData(dailyCounts);
            } catch (err) {
                console.error('Dashboard load failed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return null;

    const pieData = [
        { name: 'Free Users', value: userStats.free },
        { name: 'Premium Users', value: userStats.premium }
    ];

    const downloadReport = async (date) => {
        if (!date) return alert('Please select a date');
        try {
            const token = localStorage.getItem('jwt_token');
            const res = await fetch(`http://167.71.198.130:3001/api/admin/report?date=${date}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to download report');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Admin_Report_${date}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <Navbar />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>ADMIN DASHBOARD</h1>
                </div>

                <div className="stats-container">
                    <div className="stat-card green">
                        <div className="stat-number">{onlineCount}</div>
                        <div className="stat-label">Online Users</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-number">{userStats.total}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-number">{userStats.free}</div>
                        <div className="stat-label">Free Users</div>
                    </div>
                    <div className="stat-card yellow">
                        <div className="stat-number">{userStats.premium}</div>
                        <div className="stat-label">Premium Users</div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>New Accounts Created (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={signupData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="accounts" fill="#4CAF50" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>User Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name} (${value})`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="table-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="table-container" style={{ flexGrow: 1, maxWidth: '70%' }}>
                        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>User Table</h3>
                            <span
                                className="expand-text"
                                onClick={() => router.push('/user-management')}
                                style={{ cursor: 'pointer', color: '#007bff', fontWeight: 'bold' }}
                            >
                                Click to Expand &gt;
                            </span>
                        </div>
                        <table className="user-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Email</th>
                                <th>User Type</th>
                                <th>Subscription</th>
                                <th>Scan Count</th>
                                <th>Guardian Access</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.slice(0, 3).map(user => (
                                <tr key={user.user_id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.userType || user.accountType || '-'}</td>
                                    <td>{user.subscriptionType || (user.isPremiumUser ? 'Premium' : 'Free')}</td>
                                    <td>{user.scanCount ?? 0}</td>
                                    <td>{user.guardianModeAccess ?? user.guardianMode ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="report-box" style={{ marginLeft: '20px' }}>
                        <h3>Generate Report</h3>
                        <input
                            type="date"
                            id="report-date"
                            style={{ padding: '8px', marginBottom: '10px', display: 'block' }}
                        />
                        <button
                            className="generate-report-button"
                            onClick={() => {
                                const date = document.getElementById('report-date').value;
                                downloadReport(date);
                            }}
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}