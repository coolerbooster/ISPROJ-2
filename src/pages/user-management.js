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
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("all"); // 'all' | 'premium' | 'non-premium'

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

    async function fetchUsers() {
        try {
            const res = await listUsersAdmin(1, 1000, searchTerm);
            const filtered = (res.users || []).filter(u => {
                const isAdmin = u.userType?.toLowerCase() === "admin";
                return !isAdmin;
            });

            const usersWithScanCounts = await Promise.all(
                filtered.map(async (user) => {
                    try {
                        const scans = await getUserScansAdmin(user.user_id);
                        const isGuardian = user.userType === "Guardian";
                        return {
                            ...user,
                            subscriptionType: isGuardian ? "Basic" : user.subscriptionType,
                            scanCount: scans.length
                        };
                    } catch (err) {
                        console.error(`Failed to fetch scans for user ${user.email}`, err);
                        return {
                            ...user,
                            subscriptionType: user.userType === "Guardian" ? "Basic" : user.subscriptionType,
                            scanCount: 0
                        };
                    }
                })
            );

            setAllUsers(usersWithScanCounts);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    }

    async function handleViewScans(user) {
        try {
            const scans = await getUserScansAdmin(user.user_id);
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
            isPremiumUser: user.userType !== "Guardian" && user.subscriptionType === "Premium",
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
            await fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update user.");
        }
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

    const filteredUsers = allUsers.filter((u) => {
        if (u.userType === "Guardian") return false;
        const isPremium = u.subscriptionType === "Premium";
        if (activeView === "premium") return isPremium;
        if (activeView === "non-premium") return !isPremium;
        return true;
    });

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <h1 className="fw-bold mb-4">User Management</h1>

                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div className="btn-group">
                        <button
                            className={`btn ${activeView === "premium" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setActiveView("premium")}
                        >
                            Premium Users
                        </button>
                        <button
                            className={`btn ${activeView === "non-premium" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setActiveView("non-premium")}
                        >
                            Non-Premium Users
                        </button>
                        <button
                            className={`btn ${activeView === "all" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setActiveView("all")}
                        >
                            All Users
                        </button>
                    </div>
                    <input
                        type="text"
                        className="form-control w-auto"
                        placeholder="Search by email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                        {filteredUsers.map((u) => {
                            const guardianAccess =
                                u.subscriptionType === "Premium" &&
                                (u.guardianModeAccess ?? u.guardianMode)
                                    ? "Yes"
                                    : "No";

                            return (
                                <tr key={u.user_id}>
                                    <td>...{String(u.user_id).slice(-5)}</td>
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
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center">No users found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
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
