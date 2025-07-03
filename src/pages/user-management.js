import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from 'next/router';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [editingUser, setEditingUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        };
        fetchUsers();
    }, []);

    const handleEdit = (user) => setEditingUser({ ...user });
    const handleView = (user) => {
        router.push(`/view_photos?id=${user.user_id}`);
    };
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter((u) => u.user_id !== id));
        }
    };

    const handleSaveEdit = (updatedUser) => {
        if (!updatedUser.email.trim() || !updatedUser.password.trim()) return;
        setUsers(users.map((u) => (u.user_id === updatedUser.user_id ? updatedUser : u)));
        setEditingUser(null);
    };

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="user-container">
                <h1 className="user-title">User Management</h1>

                <div className="user-top-bar">
                    <div className="user-controls">
                        <select
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                        >
                            <option value={10}>Show 10 entries</option>
                            <option value={20}>Show 20 entries</option>
                            <option value={30}>Show 30 entries</option>
                        </select>
                    </div>
                    <div className="user-controls">
                        <input
                            type="text"
                            placeholder="Search by email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="user-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Account Type</th>
                        <th>Premium</th>
                        <th>Scan Count</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.slice(0, entriesPerPage).map((user) => (
                        <tr key={user.user_id}>
                            <td>{user.user_id}</td>
                            <td>{user.email}</td>
                            <td>{user.accountType}</td>
                            <td>{user.isPremiumUser ? "Yes" : "No"}</td>
                            <td>{user.scanCount}</td>
                            <td>
                                <button className="view-btn" onClick={() => handleView(user)}>View</button>
                                <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                                <button className="delete-btn" onClick={() => handleDelete(user.user_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan="6" className="no-users">No users found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* editingUser modal remains unchanged, update only fields if needed */}
            </div>
        </>
    );
}