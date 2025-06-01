import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
    const router = useRouter();

    // Sample data for charts
    const signupData = [
        { name: 'Day 1', users: 15 },
        { name: 'Day 2', users: 25 },
        { name: 'Day 3', users: 35 },
        { name: 'Day 4', users: 45 },
        { name: 'Day 5', users: 40 },
        { name: 'Day 6', users: 30 },
        { name: 'Day 7', users: 35 },
    ];

    const retentionData = [
        { name: 'Day 1', rate: 95 },
        { name: 'Day 2', rate: 92 },
        { name: 'Day 3', rate: 90 },
        { name: 'Day 4', rate: 88 },
        { name: 'Day 5', rate: 89 },
        { name: 'Day 6', rate: 87 },
        { name: 'Day 7', rate: 86 },
    ];

    const userDistribution = [
        { name: 'Free Users', value: 75 },
        { name: 'Premium', value: 25 }
    ];

    const COLORS = ['#FF8042', '#FFBB28'];

    // Sample user data
    const users = [
        { id: 1, email: 'user123@gmail.com', subscriptionType: 'Free', scanCount: 10, guardianMode: 'No' },
        { id: 2, email: 'jane_doe@gmail.com', subscriptionType: 'Premium', scanCount: 'Unlimited', guardianMode: 'Yes' },
        { id: 3, email: '123k_5a7w@gmail.com', subscriptionType: 'Free', scanCount: 10, guardianMode: 'No' },
    ];

    const handleLogout = () => {
        router.push('/');
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>ADMIN DASHBOARD</h1>
                </div>
                <div className="header-right">
                    <span>Welcome, Josie</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderTop: '4px solid #4CAF50' }}>
                    <h3>Online Users</h3>
                    <p className="stat-number">158</p>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #2196F3' }}>
                    <h3>Total Users</h3>
                    <p className="stat-number">304</p>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #FF9800' }}>
                    <h3>Free Users</h3>
                    <p className="stat-number">238</p>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #FFC107' }}>
                    <h3>Premium Users</h3>
                    <p className="stat-number">66</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>New Signups (Last 7 Days)</h3>
                    <BarChart width={500} height={300} data={signupData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="users" fill="#82ca9d" />
                    </BarChart>
                </div>
                <div className="chart-card">
                    <h3>User Retention Rate (7/30 Days)</h3>
                    <LineChart width={500} height={300} data={retentionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Line type="monotone" dataKey="rate" stroke="#8884d8" />
                    </LineChart>
                </div>
                <div className="chart-card">
                    <h3>User Distribution</h3>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={userDistribution}
                            cx={200}
                            cy={150}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label
                        >
                            {userDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </div>
            </div>

            {/* User Table */}
            <div className="table-section">
                <div className="table-header">
                    <h3>User Table</h3>
                    <span className="click-to-expand">Click to Expand &gt;</span>
                </div>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Subscription Type</th>
                            <th>Scan Count</th>
                            <th>Guardian Mode Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>{user.subscriptionType}</td>
                                <td>{user.scanCount}</td>
                                <td>{user.guardianMode}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 