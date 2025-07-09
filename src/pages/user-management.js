import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { listUsersAdmin, deleteUserAdmin, updateUserAdmin } from "../services/apiService";

export default function UserManagement() {
    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUserData, setEditUserData] = useState({ user_id: null, email: '', password: '', subscriptionType: 'Free' });
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    useEffect(() => {
        paginateUsers();
    }, [allUsers, currentPage, entriesPerPage]);

    const fetchUsers = async () => {
        try {
            const res = await listUsersAdmin(1, 1000, searchTerm);
            const nonAdmin = (res.users || [])
                .filter((u) => u.userType?.toLowerCase() !== "admin")
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAllUsers(nonAdmin);
            setCurrentPage(1);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const paginateUsers = () => {
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        setUsers(allUsers.slice(start, end));
    };

    const handleView = (user) => {
        router.push(`/view_photos?id=${user.user_id}&email=${encodeURIComponent(user.email)}`);
    };

    const handleEdit = (user) => {
        setEditUserData({
            user_id: user.user_id,
            email: user.email,
            password: '',
            subscriptionType: user.subscriptionType || 'Free'
        });
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUserAdmin(id);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to delete user.");
        }
    };

    const handleUpdate = async () => {
        try {
            await updateUserAdmin(editUserData.user_id, {
                email: editUserData.email,
                password: editUserData.password,
                subscriptionType: editUserData.subscriptionType
            });
            setShowEditModal(false);
            fetchUsers();
        } catch (err) {
            alert("Failed to update user.");
        }
    };

    const totalPages = Math.ceil(allUsers.length / entriesPerPage);

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage, "...", totalPages);
            }
        }

        return (
            <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
                {pages.map((page, i) =>
                    page === "..." ? (
                        <span
                            key={i}
                            className="ellipsis"
                            onClick={() => {
                                const input = prompt("Enter page number:");
                                const parsed = parseInt(input);
                                if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
                                    setCurrentPage(parsed);
                                }
                            }}
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            className={`page-btn ${currentPage === page ? "active" : ""}`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    )
                )}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <div className="user-container">
                <h1 className="user-title">User Management</h1>

                <div className="user-top-bar">
                    <div className="user-controls">
                        <label className="entries-label">
                            Show
                            <select
                                value={entriesPerPage}
                                onChange={(e) => {
                                    setEntriesPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="entries-select"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                            entries
                        </label>
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
                        {users.map((user) => (
                            <tr key={user.user_id}>
                                <td>{user.user_id}</td>
                                <td>{user.email}</td>
                                <td>{user.userType}</td>
                                <td>{user.subscriptionType === "Premium" ? "Yes" : "No"}</td>
                                <td>{user.scanCount ?? 0}</td>
                                <td>
                                    <button className="view-btn" onClick={() => handleView(user)}>View</button>
                                    <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(user.user_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="no-users">No users found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    {renderPagination()}
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
                                className="input-field"
                                value={editUserData.email}
                                onChange={(e) =>
                                    setEditUserData({ ...editUserData, email: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-row">
                            <label>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={editUserData.password}
                                onChange={(e) =>
                                    setEditUserData({ ...editUserData, password: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-row">
                            <label>Subscription</label>
                            <select
                                className="input-field"
                                value={editUserData.subscriptionType}
                                onChange={(e) =>
                                    setEditUserData({ ...editUserData, subscriptionType: e.target.value })
                                }
                            >
                                <option value="Free">Free</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    marginRight: '10px',
                                    cursor: 'pointer'
                                }}
                                onClick={handleUpdate}
                            >
                                Save
                            </button>
                            <button
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
