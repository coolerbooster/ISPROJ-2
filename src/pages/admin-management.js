// pages/admin-management.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import { AdminController } from '../controllers/AdminController';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        console.log('🏷️  AdminManagement mounted, loading admins…');
        const loadAdmins = async () => {
            try {
                const data = await AdminController.getAdmins();
                console.log('🏷️  AdminManagement — setAdmins with:', data);
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
    const paginatedAdmins = filtered.slice(0, entries);

    return (
        <>
            <Navbar />
            <div className="admin-container">
                <div className="top-bar">
                    <Link href="/add-admin-account" legacyBehavior>
                        <a className="add-admin-btn">Add Admin</a>
                    </Link>
                    <div className="search-container">
                        <label htmlFor="search" className="search-label">Search:</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="by email"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="controls">
                    <label className="entries-label">
                        Show
                        <select
                            value={entries}
                            onChange={e => setEntries(parseInt(e.target.value))}
                            className="entries-select"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                        entries
                    </label>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Password</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedAdmins.map((admin) => (
                            <tr key={admin.id}>
                                <td>{admin.id}</td>
                                <td>{admin.email}</td>
                                <td>••••••</td>
                                <td className="action-buttons">
                                    <Link
                                        href={{
                                            pathname: '/edit-admin-account',
                                            query: { id: admin.id }
                                        }}
                                        legacyBehavior
                                    >
                                        <a className="edit-btn">Edit</a>
                                    </Link>
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
            </div>
        </>
    );
}
