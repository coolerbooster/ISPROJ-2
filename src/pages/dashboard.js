import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminDashboard, listUsersAdmin, getUserScansAdmin } from '../services/apiService';
import Navbar from '../components/Navbar';
import { AuthController } from '../controllers/AuthController';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#22c55e'];

export default function Dashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({ total: 0, free: 0, premium: 0, guardian: 0 });
    const [signupData, setSignupData] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!AuthController.isAuthenticated()) {
            router.replace('/');
            return;
        }

        async function fetchData() {
            try {
                const dash = await getAdminDashboard();
                const od = dash.data?.onlineUsers ?? dash.onlineUsers ?? 0;
                setOnlineCount(od);

                const rawSignups = dash.newSignupsLast7Days || dash.data?.newSignupsLast7Days || [];

                const signupMap = {};
                rawSignups.forEach(entry => {
                    signupMap[entry.date] = entry.count;
                });

                const today = new Date();
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today);
                    d.setDate(today.getDate() - (6 - i));
                    const isoDate = d.getFullYear() + '-' +
                        String(d.getMonth() + 1).padStart(2, '0') + '-' +
                        String(d.getDate()).padStart(2, '0');
                    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const count = signupMap[isoDate] || 0;
                    return { date: label, users: count };
                });

                setSignupData(last7Days);

                const listRes = await listUsersAdmin(1, 1000, '');
                const all = listRes.users || [];
                const nonAdmin = all.filter(u => u.userType?.toLowerCase() !== 'admin');

                const enriched = await Promise.all(
                    nonAdmin.map(async u => {
                        const scansRes = await getUserScansAdmin(u.user_id);
                        const count = Array.isArray(scansRes)
                            ? scansRes.length
                            : (Array.isArray(scansRes.scans) ? scansRes.scans.length : 0);
                        return { ...u, scanCount: count };
                    })
                );

                const totalUsers = enriched.length;
                const guardians = enriched.filter(u => u.userType?.toLowerCase() === 'guardian').length;
                const premiumUsers = enriched.filter(u => u.subscriptionType === 'Premium').length;
                const freeUsers = enriched.filter(u =>
                    u.subscriptionType === 'Free' &&
                    u.userType?.toLowerCase() !== 'guardian'
                ).length;

                setUsers(enriched);
                setUserStats({ total: totalUsers, free: freeUsers, premium: premiumUsers, guardian: guardians });
            } catch (err) {
                console.error('Dashboard load failed:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    async function downloadReport(date) {
        if (!date) {
            alert('Please select a date');
            return;
        }
        try {
            const token = localStorage.getItem('jwt_token');
            const res = await fetch(`http://167.71.198.130:3001/api/admin/report?date=${date}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch report');
            const data = await res.json();
            const rawUsers = data?.data?.users || [];

            const users = rawUsers.filter(u => u.userType?.toLowerCase() !== 'admin');

            const summary = {
                premiumUsers: 0,
                freeUsers: 0,
                guardians: 0,
                totalScans: 0
            };

            users.forEach(u => {
                if (u.subscriptionType === 'Premium') summary.premiumUsers++;
                if (u.subscriptionType === 'Free') summary.freeUsers++;
                if (u.userType?.toLowerCase() === 'guardian') summary.guardians++;
                summary.totalScans += u.scanCount;
            });

            const headers = ['User ID', 'Email', 'Account Type', 'Subscription', 'Scan Count', 'Guardian Access'];
            const rows = users.map(u => [
                u.user_id,
                u.email,
                u.userType,
                u.subscriptionType,
                u.scanCount,
                u.guardianModeAccess
            ]);

            const summaryRows = [
                [],
                ['SUMMARY'],
                ['Premium Users', summary.premiumUsers],
                ['Free Users', summary.freeUsers],
                ['Guardians', summary.guardians],
                ['Total Scans', summary.totalScans]
            ];

            const csvContent = [headers, ...rows, ...summaryRows]
                .map(row => row.map(value => `"${value}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Admin_Report_${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            alert(err.message);
        }
    }

    if (isLoading) return null;

    const pieData = [
        { name: 'Free Users', value: userStats.free },
        { name: 'Premium Users', value: userStats.premium },
        { name: 'Guardians', value: userStats.guardian }
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
                                <Bar dataKey="users" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>User Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
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
                                <th>Account Type</th>
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
                                    <td>{u.scanCount}</td>
                                    <td>{u.guardianModeAccess ?? u.guardianMode ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="report-box">
                        <h3>Generate Report</h3>
                        <input
                            type="date"
                            id="report-date"
                            max={new Date().toISOString().split('T')[0]}
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
