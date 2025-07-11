import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import { AdminController } from '../controllers/AdminController';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ email: '', password: '', confirmPassword: '' });
    const [passwordStrength, setPasswordStrength] = useState('');

    const router = useRouter();

    useEffect(() => {
        const loadAdmins = async () => {
            try {
                const data = await AdminController.getAdmins();
                setAdmins(data);
            } catch (err) {
                console.error('🛑 AdminManagement loadAdmins error:', err);
            }
        };
        loadAdmins();
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        const results = await AdminController.searchAdmins(query);
        setAdmins(results);
        setCurrentPage(1);
    };

    const getPasswordStrength = (password) => {
        if (password.length < 8) return 'Weak';
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        if (hasLetter && hasNumber && hasSymbol) return 'Strong';
        if ((hasLetter && hasNumber) || (hasLetter && hasSymbol)) return 'Medium';
        return 'Weak';
    };

    const handleAddAdmin = async () => {
        const { email, password, confirmPassword } = newAdmin;

        if (!email || !password || !confirmPassword) {
            return alert('All fields are required.');
        }

        if (password !== confirmPassword) {
            return alert('Passwords do not match.');
        }

        if (password.length < 8) {
            return alert('Password must be at least 8 characters long.');
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasLetter || !hasNumberOrSymbol) {
            return alert('Password must include at least one letter and one number or special character.');
        }

        try {
            await AdminController.createAdmin({ email, password });
            setShowAddModal(false);
            setNewAdmin({ email: '', password: '', confirmPassword: '' });
            setPasswordStrength('');
            const updatedAdmins = await AdminController.getAdmins();
            setAdmins(updatedAdmins);
        } catch (err) {
            alert('Failed to create admin: ' + err.message);
        }
    };

    const filtered = admins.filter(admin =>
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / entries);
    const start = (currentPage - 1) * entries;
    const paginatedAdmins = filtered.slice(start, start + entries);

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <h1 className="mb-4 h4 text-center text-md-start">Admin Accounts</h1>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-2">
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Admin</button>
                    <div className="d-flex flex-wrap gap-3">
                        <div className="d-flex align-items-center">
                            <label className="me-2">Show</label>
                            <select
                                className="form-select form-select-sm"
                                value={entries}
                                onChange={e => {
                                    setEntries(+e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                            <span className="ms-2">entries</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <label htmlFor="search" className="me-2">Search:</label>
                            <input
                                id="search"
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="by email"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered text-center">
                        <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedAdmins.map((admin, index) => (
                            <tr key={admin.id}>
                                <td>{start + index + 1}</td>
                                <td>{admin.email}</td>
                                <td>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(admin.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedAdmins.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-muted">No admins found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-3">
                        <ul className="pagination pagination-sm">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '90%', width: '500px' }}>
                        <h2 className="h5 mb-3">Add Admin</h2>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={newAdmin.email}
                                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={newAdmin.password}
                                onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={newAdmin.confirmPassword}
                                onChange={e => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                            />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-success" onClick={handleAddAdmin}>Create</button>
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}