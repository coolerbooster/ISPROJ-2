// user-management.js
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import {
    listUsersAdmin,
    deleteUserAdmin,
    updateUserAdmin,
    getUserScansAdmin
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
            const nonAdmin = (res.users || []).filter(u => u.userType?.toLowerCase() !== "admin");

            const usersWithScanCounts = await Promise.all(
                nonAdmin.map(async (user) => {
                    try {
                        const scans = await getUserScansAdmin(user.user_id);
                        return { ...user, scanCount: scans.length };
                    } catch (err) {
                        console.error(`Failed to fetch scans for user ${user.email}`, err);
                        return { ...user, scanCount: 0 };
                    }
                })
            );

            setAllUsers(usersWithScanCounts);
            setCurrentPage(1);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    }

    async function fetchUsersWithoutReset() {
        try {
            const res = await listUsersAdmin(1, 1000, searchTerm);
            const nonAdmin = (res.users || []).filter(u => u.userType?.toLowerCase() !== "admin");
            setAllUsers(nonAdmin);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    }

    async function handleViewScans(user) {
        try {
            const scans = await getUserScansAdmin(user.user_id);

            setAllUsers(prev =>
                prev.map(u =>
                    u.user_id === user.user_id
                        ? { ...u, scanCount: scans.length }
                        : u
                )
            );

            router.push(`/user-scans?id=${user.user_id}&email=${encodeURIComponent(user.email)}&count=${scans.length}`);
        } catch (err) {
            console.error("Failed to fetch scans for user:", err);
            alert("Could not load scan data.");
        }
    }

    function handleEdit(user) {
        setEditUserData({
            user_id: user.user_id,
            email: user.email,
            accountType: user.userType,
            isPremiumUser: user.subscriptionType === "Premium",
            password: "",
            passwordEditable: false,
            scanCount: user.scanCount || 0
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
            const prevPage = currentPage;
            await fetchUsersWithoutReset();
            setCurrentPage(prevPage);
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

    const handleViewLogs = (user) => {
        router.push({
            pathname: '/user-logs',
            query: {
                userId: user.user_id || user._id,
                email: user.email || ''
            }
        });
    };

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <h1 className="fw-bold mb-4">User Management</h1>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                    <div>
                        Show{" "}
                        <select
                            className="form-select d-inline-block w-auto"
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(+e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>{" "}
                        entries
                    </div>
                    <div className="mt-2 mt-md-0">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                            <th>Guardian Access</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => {
                            const guardianAccess =
                                u.subscriptionType === "Premium" &&
                                (u.guardianModeAccess ?? u.guardianMode)
                                    ? "Yes"
                                    : "No";

                            return (
                                <tr key={u.user_id}>
                                    <td>{u.user_id}</td>
                                    <td>{u.email}</td>
                                    <td>{u.userType}</td>
                                    <td>{u.subscriptionType === "Premium" ? "Yes" : "No"}</td>
                                    <td>{u.scanCount !== undefined ? u.scanCount : "-"}</td>
                                    <td>{guardianAccess}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-1">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleViewScans(u)}
                                                disabled={u.userType === "Guardian"}
                                                style={{
                                                    opacity: u.userType === "Guardian" ? 0.5 : 1,
                                                    cursor: u.userType === "Guardian" ? "not-allowed" : "pointer"
                                                }}
                                            >
                                                View Scans
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleViewLogs(u)}
                                            >
                                                View Logs
                                            </button>
                                            <button className="btn btn-warning btn-sm" onClick={() => handleEdit(u)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.user_id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center">No users found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            &lt;
                        </button>
                        {pages.map((p, idx) =>
                            p === "..." ? (
                                <span key={idx} className="px-2">...</span>
                            ) : (
                                <button
                                    key={p}
                                    className={`btn btn-sm ${currentPage === p ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setCurrentPage(p)}
                                >
                                    {p}
                                </button>
                            )
                        )}
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>

            {showEditModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={editUserData.email}
                                        onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Account Type</label>
                                    <select
                                        className="form-select"
                                        value={editUserData.accountType}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setEditUserData({
                                                ...editUserData,
                                                accountType: newType,
                                                isPremiumUser: newType === "Guardian" ? false : editUserData.isPremiumUser
                                            });
                                        }}
                                    >
                                        <option value="User">User</option>
                                        <option value="Guardian">Guardian</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Premium?</label>
                                    <select
                                        className="form-select"
                                        value={editUserData.isPremiumUser ? "Yes" : "No"}
                                        onChange={(e) =>
                                            setEditUserData({
                                                ...editUserData,
                                                isPremiumUser: e.target.value === "Yes",
                                            })
                                        }
                                        disabled={editUserData.accountType === "Guardian"}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes" disabled={editUserData.accountType === "Guardian"}>Yes</option>
                                    </select>
                                    {editUserData.accountType === "Guardian" && (
                                        <div className="form-text text-danger">Guardians cannot have Premium access.</div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleUpdate}>Save</button>
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
