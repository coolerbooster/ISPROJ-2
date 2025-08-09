// user-management.js
import React, { useState, useEffect } from "react";
import $ from "jquery";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import {
    listUsersAdmin,
    deleteUserAdmin,
    updateUserAdmin,
    getUserScansAdmin,
    getUserGuardians,
    unbindGuardian,
    bindGuardian,
    listGuardians,
    getUserTransactions,
    makeUserPremium,
    removeUserPremium
} from "../services/apiService";
import { shortenId } from "../utils/stringUtils";
import UserTransactionsModal from "../components/UserTransactionsModal";

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
    const [showGuardiansModal, setShowGuardiansModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userGuardians, setUserGuardians] = useState([]);
    const [availableGuardians, setAvailableGuardians] = useState([]);
    const [selectedGuardian, setSelectedGuardian] = useState('');
    const [showViewGuardiansModal, setShowViewGuardiansModal] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    const [showUserTransactionsModal, setShowUserTransactionsModal] = useState(false);
    const [viewingUserTransactions, setViewingUserTransactions] = useState(null);
    const [userTransactions, setUserTransactions] = useState([]);

    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);


    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const filtered = allUsers.filter((u) => {
            if (u.userType === "Guardian") return false;

            const matchesSearch = !searchTerm || u.email.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            const isPremium = u.subscriptionType === "Premium";
            if (activeView === "premium") return isPremium;
            if (activeView === "non-premium") return !isPremium;

            return true;
        });

        setFilteredUsers(filtered);
    }, [allUsers, searchTerm, activeView]);

    async function fetchUsers() {
        try {
            const res = await listUsersAdmin(1, 1000, searchTerm);
            const filtered = (res.users || []).filter(u => {
                const isAdmin = u.userType?.toLowerCase() === "admin";
                return !isAdmin;
            });

            const usersWithData = await Promise.all(
                filtered.map(async (user) => {
                    try {
                        const scans = await getUserScansAdmin(user.user_id);
                        const guardians = user.subscriptionType === 'Premium'
                            ? await getUserGuardians(user.user_id)
                            : [];
                        const isGuardian = user.userType === "Guardian";
                        return {
                            ...user,
                            subscriptionType: isGuardian ? "Basic" : user.subscriptionType,
                            scanCount: scans.length,
                            guardians: guardians.guardians || []
                        };
                    } catch (err) {
                        console.error(`Failed to fetch data for user ${user.email}`, err);
                        return {
                            ...user,
                            subscriptionType: user.userType === "Guardian" ? "Basic" : user.subscriptionType,
                            scanCount: 0,
                            guardians: []
                        };
                    }
                })
            );

            setAllUsers(usersWithData);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    }

    const refreshUserGuardians = async (userId) => {
        try {
            const guardiansResponse = await getUserGuardians(userId);
            setAllUsers(prevUsers =>
                prevUsers.map(u =>
                    u.user_id === userId
                        ? { ...u, guardians: guardiansResponse.guardians || [] }
                        : u
                )
            );
        } catch (error) {
            console.error('Failed to refresh guardians:', error);
        }
    };

    async function handleViewScans(user) {
        try {
            const scans = await getUserScansAdmin(user.user_id);
            router.push(`/user-scans?id=${user.user_id}&email=${encodeURIComponent(user.email)}&count=${scans.length}`);
        } catch (err) {
            console.error("Failed to fetch scans for user:", err);
            alert("Could not load scan data.");
        }
    }

    async function handleViewTransactions(user) {
        setViewingUserTransactions(user);
        try {
            const data = await getUserTransactions(user.user_id);
            setUserTransactions(data);
            setShowUserTransactionsModal(true);
        } catch (err) {
            console.error("Failed to fetch transactions for user:", err);
            alert("Could not load transaction data.");
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


    const handleManageGuardians = async (user) => {
        setSelectedUser(user);
        try {
            const completeUser = allUsers.find(u => u.user_id === user.user_id) || user;
            setUserGuardians(completeUser.guardians || []);

            const allGuardiansResponse = await listGuardians();
            setAvailableGuardians(allGuardiansResponse || []);
            setShowGuardiansModal(true);
        } catch (error) {
            console.error('Error fetching guardians:', error);
        }
    };

    const handleUnbindGuardian = async (guardianId) => {
        if (!confirm('Are you sure you want to unbind this guardian?')) return;
        try {
            await unbindGuardian(selectedUser.user_id, guardianId);
            await refreshUserGuardians(selectedUser.user_id);
            setShowGuardiansModal(false);
        } catch (error) {
            console.error('Error unbinding guardian:', error);
            alert('Failed to unbind guardian.');
        }
    };

    const handleBindGuardian = async () => {
        if (!selectedGuardian) {
            alert('Please select a guardian to bind.');
            return;
        }
        try {
            await bindGuardian(selectedUser.user_id, selectedGuardian);
            await refreshUserGuardians(selectedUser.user_id);
            setShowGuardiansModal(false);
        } catch (error) {
            console.error('Error binding guardian:', error);
            alert('Failed to bind guardian.');
        }
    };

    const handleViewGuardians = (user) => {
        setViewingUser(user);
        setShowViewGuardiansModal(true);
    };

    async function handleTogglePremium(user) {
        if (!confirm(`Are you sure you want to ${user.subscriptionType === 'Premium' ? 'revoke' : 'grant'} premium status for ${user.email}?`)) {
            return;
        }

        try {
            if (user.subscriptionType === 'Premium') {
                await removeUserPremium(user.user_id);
            } else {
                await makeUserPremium(user.user_id);
            }
            // Refresh the user list to show the updated status
            await fetchUsers();
        } catch (error) {
            console.error('Failed to toggle premium status:', error);
            alert(`Failed to update premium status: ${error.message}`);
        }
    }


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
                    <table id="usersTable" className="table table-bordered table-hover text-center">
                        <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Scan Count</th>
                            <th>Premium Expiration</th>
                            <th>Premium</th>
                            <th>Actions</th>
                            <th>Guardian Management</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map(u => (
                            <React.Fragment key={u.user_id}>
                                <tr>
                                    <td>{shortenId(u.user_id)}</td>
                                    <td>{u.email}</td>
                                    <td>{u.scanCount !== undefined ? u.scanCount : "-"}</td>
                                    <td>
                                        {u.subscriptionType === 'Premium' ? (
                                            <span className="text-success fw-bold">✓</span>
                                        ) : (
                                            <span className="text-danger fw-bold">✗</span>
                                        )}
                                    </td>
                                    <td>
                                        {u.subscriptionType === 'Premium' && u.premium_expiration
                                            ? new Date(u.premium_expiration).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : 'N/A'}
                                    </td>
                                    {/* Actions column */}
                                    <td>
                                        <div className="d-flex justify-content-center gap-1 flex-wrap">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleViewScans(u)}
                                            >
                                                View Scans
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleViewTransactions(u)}
                                            >
                                                View Transactions
                                            </button>
                                            <button
                                                className={`btn btn-sm ${u.subscriptionType === 'Premium' ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => handleTogglePremium(u)}
                                            >
                                                {u.subscriptionType === 'Premium' ? 'Revoke Premium' : 'Make Premium'}
                                            </button>
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => handleEdit(u)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(u.user_id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                    {/* Guardian Management column */}
                                    <td>
                                        {u.subscriptionType === 'Premium' ? (
                                            <div className="d-flex justify-content-center gap-1">
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleViewGuardians(u)}
                                                >
                                                    View Guardians
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleManageGuardians(u)}
                                                >
                                                    Manage Guardians
                                                </button>
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                           </React.Fragment>
                       ))}
                       {filteredUsers.length === 0 && (
                           <tr>
                               <td colSpan={6} className="text-center">No users found.</td>
                           </tr>
                       )}
                       </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
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

            {/* Manage Guardians Modal */}
            <GuardiansModal
                show={showGuardiansModal}
                onHide={() => setShowGuardiansModal(false)}
                user={selectedUser}
                guardians={userGuardians}
                availableGuardians={availableGuardians}
                onUnbind={handleUnbindGuardian}
                onBind={handleBindGuardian}
                setSelectedGuardian={setSelectedGuardian}
            />

            {/* View Guardians Modal */}
            <ViewGuardiansModal
                show={showViewGuardiansModal}
                onHide={() => setShowViewGuardiansModal(false)}
                user={viewingUser}
            />

            <UserTransactionsModal
                isOpen={showUserTransactionsModal}
                onClose={() => {
                    setShowUserTransactionsModal(false);
                    setViewingUserTransactions(null);
                    setUserTransactions([]);
                }}
                transactions={userTransactions}
                user={viewingUserTransactions}
            />
        </>
    );
}

const ViewGuardiansModal = ({ show, onHide, user }) => {
    if (!show) return null;
    const guardians = user?.guardians || [];

    return (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Guardians for {user.email}</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <div className="modal-body">
                        {guardians.length > 0 ? (
                            <ul className="list-group">
                                {guardians.map(g => (
                                    <li key={g.guardian_id} className="list-group-item">
                                        {g.guardian_email}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No guardians are currently bound to this user.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onHide}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GuardiansModal = ({ show, onHide, user, guardians, availableGuardians, onUnbind, onBind, setSelectedGuardian }) => {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Manage Guardians for {user.email}</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <div className="modal-body">
                        <h6>Bound Guardians</h6>
                        {guardians.length > 0 ? (
                            <ul className="list-group mb-3">
                                {guardians.map(g => (
                                    <li key={g.guardian_id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {g.guardian_email}
                                        <button className="btn btn-danger btn-sm" onClick={() => onUnbind(g.guardian_id)}>Unbind</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No guardians are currently bound to this user.</p>
                        )}

                        <hr />

                        <h6>Bind New Guardian</h6>
                        <div className="input-group">
                            <select className="form-select" onChange={(e) => setSelectedGuardian(e.target.value)}>
                                <option value="">Select a Guardian</option>
                                {availableGuardians.map(g => (
                                    <option key={g.user_id} value={g.user_id}>{g.email}</option>
                                ))}
                            </select>
                            <button className="btn btn-primary" onClick={onBind}>Bind Guardian</button>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onHide}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
