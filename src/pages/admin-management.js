import { useEffect, useState } from 'react';
import { AdminController } from '../controllers/AdminController';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '', id: null });
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        setAdmins(AdminController.getAdmins());
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        const filtered = AdminController.searchAdmins(query);
        setAdmins(filtered);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            AdminController.updateAdmin(form.id, form);
        } else {
            AdminController.createAdmin(form);
        }
        setForm({ email: '', firstName: '', lastName: '', password: '', id: null });
        setEditing(false);
        setAdmins(AdminController.getAdmins());
    };

    const handleEdit = (admin) => {
        setForm(admin);
        setEditing(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this admin?')) {
            AdminController.deleteAdmin(id);
            setAdmins(AdminController.getAdmins());
        }
    };

    const paginatedAdmins = admins.slice(0, entries);

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
                            placeholder="by email or name"
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
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Password</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedAdmins.map((admin) => (
                            <tr key={admin.id}>
                                <td>{admin.id}</td>
                                <td>{admin.email}</td>
                                <td>{admin.firstName}</td>
                                <td>{admin.lastName}</td>
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
                                <td colSpan="6" className="no-admins">No admins found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}