import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import { AdminController } from '../controllers/AdminController';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
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

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this admin?')) {
            try {
                await AdminController.deleteAdmin(id);
                const updatedAdmins = await AdminController.getAdmins();
                setAdmins(updatedAdmins);
            } catch (err) {
                console.error(err);
                alert('Failed to delete admin.');
            }
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
            <div className="admin-container">
                <h1 className="user-title">Admin Accounts</h1>

                <div className="top-controls">
                    <Link href="/add-admin-account" legacyBehavior>
                        <a className="add-admin-btn">Add Admin</a>
                    </Link>
                    <div className="entries-search-row">
                        <div className="entries-label">
                            Show{' '}
                            <select
                                className="entries-select"
                                value={entries}
                                onChange={e => {
                                    setEntries(+e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>{' '}
                            entries
                        </div>
                        <div className="search-container">
                            <label htmlFor="search">Search: </label>
                            <input
                                id="search"
                                type="text"
                                placeholder="by email"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead style={{ backgroundColor: '#d1d5db' }}>
                        <tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Password</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedAdmins.map((admin, index) => (
                            <tr key={admin.id}>
                                <td>{start + index + 1}</td>
                                <td>{admin.email}</td>
                                <td>••••••</td>
                                <td className="action-buttons">
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(admin.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedAdmins.length === 0 && (
                            <tr>
                                <td colSpan="4" className="no-admins">No admins found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={page === currentPage ? 'active' : ''}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
                    </div>
                )}
            </div>
        </>
    );
}