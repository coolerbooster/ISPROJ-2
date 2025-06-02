import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const router = useRouter();

    // Sample data for charts
    const signupData = [
        { name: 'Jan', users: 8 },
        { name: 'Feb', users: 10 },
        { name: 'Mar', users: 9 },
        { name: 'Apr', users: 12 },
        { name: 'May', users: 15 },
        { name: 'Jun', users: 11 },
        { name: 'Jul', users: 13 },
    ];

    const userDistribution = [
        { name: 'Free Users', value: 75.3 },
        { name: 'Premium Users', value: 24.7 }
    ];

    const COLORS = ['#FF8042', '#FFD700'];

    // Sample user data
    const users = [
        { id: 10, email: 'user1234@gmail.com', userType: 'User', subscriptionType: 'Free', scanCount: 10, guardianMode: 'No' },
        { id: 9, email: 'jose_rosario@gmail.com', userType: 'Guardian', subscriptionType: 'Premium', scanCount: 'Unlimited', guardianMode: 'Yes' },
        { id: 8, email: '1234_567rpv@gmail.com', userType: 'User', subscriptionType: 'Free', scanCount: 10, guardianMode: 'No' },
    ];

    return (
        <div className="dashboard-container">
            {/* Top Navigation */}
            <nav className="nav-bar">
                <div className="nav-left">
                    <div className="logo">JUANEYE</div>
                </div>
                <div className="nav-center">
                    <a href="#" className="nav-link active">Dashboard</a>
                    <a href="#" className="nav-link">User Management</a>
                    <a href="#" className="nav-link">Admin Accounts</a>
                </div>
                <div className="nav-right">
                    <span className="welcome-text">Welcome, Josie</span>
                    <button onClick={() => router.push('/')} className="logout-btn">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>ADMIN DASHBOARD</h1>
                </div>

                {/* Stats Cards */}
                <div className="stats-container">
                    <div className="stat-card green">
                        <div className="stat-number">158</div>
                        <div className="stat-label">Online Users</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-number">304</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-number">238</div>
                        <div className="stat-label">Free Users</div>
                    </div>
                    <div className="stat-card yellow">
                        <div className="stat-number">66</div>
                        <div className="stat-label">Premium Users</div>
                    </div>
                </div>

                {/* Report Section */}
                <div className="report-section">
                    <div className="date-picker">
                        <span>Date:</span>
                        <input type="date" defaultValue="2025-03-07" />
                    </div>
                    <button className="generate-report-btn">GENERATE REPORT</button>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>New Signups (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={signupData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
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
                                    data={userDistribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({name, value}) => `${name} ${value.toFixed(1)}%`}
                                >
                                    {userDistribution.map((entry, index) => (
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
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.email}</td>
                                        <td>{user.userType}</td>
                                        <td>{user.subscriptionType}</td>
                                        <td>{user.scanCount}</td>
                                        <td>{user.guardianMode}</td>
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