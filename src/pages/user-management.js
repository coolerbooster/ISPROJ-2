import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import {
    listUsersAdmin,
    deleteUserAdmin,
    updateUserAdmin
} from "../services/apiService";

export default function UserManagement() {
    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editUserData, setEditUserData] = useState({
        user_id: null,
        email: "",
        accountType: "User",
        isPremiumUser: false,
        password: "",
        passwordEditable: false,
        scanCount: 0
    });

    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    useEffect(() => {
        const start = (currentPage - 1) * entriesPerPage;
        setUsers(allUsers.slice(start, start + entriesPerPage));
    }, [allUsers, currentPage, entriesPerPage]);

    async function fetchUsers() {
        try {
            const res = await listUsersAdmin(1, 1000, searchTerm);
            const nonAdmin = (res.users || []).filter(
                u => u.userType?.toLowerCase() !== "admin"
            );
            setAllUsers(nonAdmin);
            setCurrentPage(1);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    }

    function handleView(user) {
        router.push(`/view_photos?id=${user.user_id}&email=${encodeURIComponent(user.email)}`);
    }

    function handleEdit(user) {
        setEditUserData({
            user_id: user.user_id,
            email: user.email,
            accountType: user.userType,
            isPremiumUser: user.subscriptionType === "Premium",
            scanCount: user.scanCount ?? 0,
            password: "",
            passwordEditable: false
        });
        setShowEditModal(true);
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUserAdmin(id);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to delete user.");
        }
    }

    async function handleUpdate() {
        try {
            await updateUserAdmin(
                editUserData.user_id,
                editUserData.email,
                editUserData.accountType,
                editUserData.isPremiumUser,
                editUserData.scanCount
            );
            setShowEditModal(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update user.");
        }
    }

    const totalPages = Math.ceil(allUsers.length / entriesPerPage);
    const pages = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
        pages.push(1, '...', currentPage, '...', totalPages);
    }

    return (
        <>
            <Navbar />
            <div className="user-container">
                <div className="top-controls">
                    <h1 className="user-title">User Management</h1>
                    <div className="entries-search-row">
                        <div className="entries-label">
                            Show{' '}
                            <select
                                className="entries-select"
                                value={entriesPerPage}
                                onChange={e => { setEntriesPerPage(+e.target.value); setCurrentPage(1); }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                            {' '}entries
                        </div>
                        <div className="search-container">
                            <label htmlFor="search">Search: </label>
                            <input
                                type="text"
                                placeholder="by email"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-container">
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
                            {users.map(u => (
                                <tr key={u.user_id}>
                                    <td>{u.user_id}</td>
                                    <td>{u.email}</td>
                                    <td>{u.userType}</td>
                                    <td>{u.subscriptionType === 'Premium' ? 'Yes' : 'No'}</td>
                                    <td>{u.scanCount}</td>
                                    <td>
                                        <button className="view-btn" onClick={() => handleView(u)}>View</button>
                                        <button className="edit-btn" onClick={() => handleEdit(u)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(u.user_id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan={6}>No users found.</td></tr>}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
                                {pages.map((p, idx) => p === '...' ? (
                                    <span key={idx} className="ellipsis">...</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={currentPage === p ? 'active' : ''}
                                        onClick={() => setCurrentPage(p)}
                                    >{p}</button>
                                ))}
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Edit User</h2>
                        <div className="form-row">
                            <label>Email</label>
                            <input
                                type="email"
                                value={editUserData.email}
                                onChange={e => setEditUserData({ ...editUserData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-row">
                            <label>Account Type</label>
                            <select
                                value={editUserData.accountType}
                                onChange={e => setEditUserData({ ...editUserData, accountType: e.target.value })}
                            >
                                <option value="User">User</option>
                                <option value="Guardian">Guardian</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Premium?</label>
                            <select
                                value={editUserData.isPremiumUser ? 'Yes' : 'No'}
                                onChange={e => setEditUserData({ ...editUserData, isPremiumUser: e.target.value === 'Yes' })}
                            >
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Password</label>
                            <input
                                type="password"
                                value={editUserData.passwordEditable ? editUserData.password : '••••••••'}
                                onFocus={() => !editUserData.passwordEditable && setEditUserData({ ...editUserData, passwordEditable: true, password: '' })}
                                onChange={e => setEditUserData({ ...editUserData, password: e.target.value })}
                                readOnly={!editUserData.passwordEditable}
                            />
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button className="edit-btn" onClick={handleUpdate}>Save</button>
                            <button className="delete-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}