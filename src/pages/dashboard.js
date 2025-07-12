import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminDashboard, listUsersAdmin, getUserScansAdmin, generateReport } from '../services/apiService';
import Navbar from '../components/Navbar';
import { AuthController } from '../controllers/AuthController';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';

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

    // Top-level helper (outside of the component)
    async function downloadReport(date) {
        if (!date) {
            alert('Please select a date');
            return;
        }

        try {
            // 1) fetch dashboard + per-date users
            const [dashResp, reportData] = await Promise.all([
                getAdminDashboard(),
                generateReport(date),
            ]);
            const dash     = dashResp.data ?? dashResp;
            const usersRaw = reportData.users ?? [];

            // 2) compute metrics
            const generatedAt  = new Date().toLocaleString();
            const reportFor    = reportData.date;
            const onlineUsers  = String(dash.onlineUsers  ?? 0);
            const totalUsers   = String(usersRaw.length);
            const freeUsers    = String(usersRaw.filter(u => u.subscriptionType === 'Free').length);
            const premiumUsers = String(usersRaw.filter(u => u.subscriptionType === 'Premium').length);

            // 3) build array-of-arrays, casting every “number” to a string
            const aoa = [
                ['Report Generated At', generatedAt],
                ['Report For Date',     reportFor],
                ['Online Users',        onlineUsers],
                ['Total Users',         totalUsers],
                ['Free Users',          freeUsers],
                ['Premium Users',       premiumUsers],
                [],  // blank row
                // header row (all strings)
                ['user_id','email','userType','subscriptionType','scanCount','guardianModeAccess'],
                // data rows (user_id & scanCount as strings)
                ...usersRaw.map(u => [
                    String(u.user_id),
                    u.email,
                    u.userType,
                    u.subscriptionType,
                    String(u.scanCount),
                    u.guardianModeAccess,
                ]),
            ];

            // 4) convert to sheet & style bold labels + header
            const sheet = XLSX.utils.aoa_to_sheet(aoa);
            // bold A1–A6
            ['A1','A2','A3','A4','A5','A6'].forEach(addr => {
                if (sheet[addr]) sheet[addr].s = { font: { bold: true } };
            });
            // bold headers at row 8 (A8–F8)
            ['A8','B8','C8','D8','E8','F8'].forEach(addr => {
                if (sheet[addr]) {
                    sheet[addr].s = sheet[addr].s || {};
                    sheet[addr].s.font = { ...(sheet[addr].s.font || {}), bold: true };
                }
            });

            // 5) column widths
            sheet['!cols'] = [
                { wch:20 }, { wch:30 }, { wch:15 },
                { wch:20 }, { wch:10 }, { wch:20 },
            ];

            // 6) assemble & download (with styles)
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, sheet, 'Report');
            XLSX.writeFile(wb, `Admin_Report_${date}.xlsx`, { cellStyles: true });

        } catch (err) {
            console.error('Report generation failed:', err);
            alert(err.message || 'Error generating report');
        }
    }


    if (isLoading) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    const pieData = [
        { name: 'Free Users', value: userStats.free },
        { name: 'Premium Users', value: userStats.premium },
        { name: 'Guardians', value: userStats.guardian }
    ];

    return (
        <div className="dashboard-container">
            <Navbar />
            <div className="container py-4">
                <div className="text-center text-md-start mb-4">
                    <h1 className="fw-bold">ADMIN DASHBOARD</h1>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="stat-card green text-center">
                            <div className="stat-number">{onlineCount}</div>
                            <div className="stat-label">Online Users</div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="stat-card blue text-center">
                            <div className="stat-number">{userStats.total}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="stat-card orange text-center">
                            <div className="stat-number">{userStats.free}</div>
                            <div className="stat-label">Free Users</div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="stat-card yellow text-center">
                            <div className="stat-number">{userStats.premium}</div>
                            <div className="stat-label">Premium Users</div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <div className="chart-card">
                            <h3 className="h5 text-center text-md-start">New Signups (Last 7 Days)</h3>
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
                    </div>
                    <div className="col-md-6">
                        <div className="chart-card">
                            <h3 className="h5 text-center text-md-start">User Distribution</h3>
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
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h3 className="h5">User Table</h3>
                            <span
                                className="text-primary fw-semibold"
                                style={{ cursor: 'pointer' }}
                                onClick={() => router.push('/user-management')}
                            >
            Click to Expand &gt;
        </span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover text-center">
                                <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Account Type</th>
                                    <th>Premium</th>
                                    <th>Scan Count</th>
                                    <th>Guardian Mode</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.slice(0, 3).map(u => {
                                    const guardianAccess =
                                        u.subscriptionType === 'Premium' &&
                                        (u.guardianModeAccess ?? u.guardianMode)
                                            ? 'Yes'
                                            : 'No';

                                    return (
                                        <tr key={u.user_id}>
                                            <td>{u.user_id}</td>
                                            <td>{u.email}</td>
                                            <td>{u.userType}</td>
                                            <td>{u.subscriptionType === 'Premium' ? 'Yes' : 'No'}</td>
                                            <td>{u.scanCount}</td>
                                            <td>{guardianAccess}</td>
                                        </tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center">No users found.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="p-3 border rounded shadow-sm">
                            <h3 className="h5 mb-3">Generate Report</h3>
                            <input
                                type="date"
                                id="report-date"
                                className="form-control mb-3"
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <button
                                className="btn btn-success w-100"
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
        </div>
    );
}
