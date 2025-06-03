import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { AuthController } from '../controllers/AuthController';

const COLORS = ['#FF8042', '#FFD700'];

export default function Dashboard() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({ total: 0, premium: 0, free: 0 });
    const [signupData, setSignupData] = useState([]);

    useEffect(() => {
        if (!AuthController.isAuthenticated()) {
            router.replace('/');
        }
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            if (!AuthController.isAuthenticated()) {
                router.replace('/');
            }
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/dashboard/users');
                const data = await res.json();
                setUsers(data.users);
                setUserStats(data.stats);

                // Prepare signup data for last 7 days
                const today = new Date();
                const dailyCounts = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() - (6 - i));
                    return {
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        users: data.users.filter(u => {
                            const createdAt = new Date(u.createdAt);
                            return createdAt.toDateString() === date.toDateString() && u.accountType !== 'admin';
                        }).length
                    };
                });
                setSignupData(dailyCounts);

            } catch (error) {
                console.error('Failed to load dashboard data', error);
            }
        };
        fetchDashboardData();
    }, []);

    const pieData = [
        { name: 'Free Users', value: userStats.free },
        { name: 'Premium Users', value: userStats.premium }
    ];

    return (
        <div className="dashboard-container">
            <Navbar username="Josie" />

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>ADMIN DASHBOARD</h1>
                </div>

                <div className="stats-container">
                    <div className="stat-card green">
                        <div className="stat-number">158</div>
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

                {/* Charts Grid */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>New Signups (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={signupData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, value }) => `${name} ${value}`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Table */}
                <div className="table-section">
                    <div className="table-header">
                        <h3>User Table <span className="expand-text">Click to Expand {String.fromCharCode(62)}</span></h3>
                    </div>
                    <div className="table-container">
                        <table className="user-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Email</th>
                                <th>UserType</th>
                                <th>Subscription Type</th>
                                <th>Scan Count</th>
                                <th>Guardian Mode Access</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.user_id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.accountType}</td>
                                    <td>{user.isPremiumUser ? 'Premium' : 'Free'}</td>
                                    <td>{user.scanCount ?? 0}</td>
                                    <td>{user.guardianMode ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

