import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminDashboard, listUsersAdmin } from '../services/apiService';
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
    const [userStats, setUserStats] = useState({ total: 0, free: 0, premium: 0 });
    const [signupData, setSignupData] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!AuthController.isAuthenticated()) {
            router.replace('/');
            return;
        }

        const fetchData = async () => {
            try {
                // fetch dashboard counts from backend (including nested data)
                const dash = await getAdminDashboard();
                // handle nested data structure
                const od = dash.data?.onlineUsers ?? dash.onlineUsers;
                setOnlineCount(od);

                // fetch all accounts then strip out Admins
                const userRes = await listUsersAdmin(1, 1000, '');
                const allUsers = userRes.users || [];
                const nonAdmin = allUsers.filter(
                    u => u.userType?.toLowerCase() !== 'admin'
                );
                setUsers(nonAdmin);

                // compute stats for non-admin users
                const totalUsers   = nonAdmin.length;
                const freeUsers    = nonAdmin.filter(u => u.subscriptionType === 'Free').length;
                const premiumUsers = nonAdmin.filter(u => u.subscriptionType === 'Premium').length;
                setUserStats({ total: totalUsers, free: freeUsers, premium: premiumUsers });

                // build signups-per-day (last 7 days)
                const today = new Date();
                const daily = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() - (6 - i));
                    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const count = nonAdmin.filter(u =>
                        new Date(u.createdAt).toDateString() === date.toDateString()
                    ).length;
                    return { date: label, users: count };
                });
                setSignupData(daily);
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
        { name: 'Free Users',    value: userStats.free    },
        { name: 'Premium Users', value: userStats.premium }
    ];

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
                        <h3>New Signups (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={signupData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="users" fill="#4CAF50" />
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
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i]} />
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
                            {users.slice(0, 3).map(u => (
                                <tr key={u.user_id}>
                                    <td>{u.user_id}</td>
                                    <td>{u.email}</td>
                                    <td>{u.userType}</td>
                                    <td>{u.subscriptionType}</td>
                                    <td>{u.scanCount ?? 0}</td>
                                    <td>{u.guardianModeAccess ?? u.guardianMode ? 'Yes' : 'No'}</td>
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