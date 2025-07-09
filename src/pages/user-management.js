// pages/user-management.js

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { listUsersAdmin, deleteUserAdmin } from "../services/apiService";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, entriesPerPage]);

    const fetchUsers = async () => {
        try {
            const res = await listUsersAdmin(1, entriesPerPage, searchTerm);
            // strip out Admin accounts here:
            const nonAdmin = (res.users || []).filter(
                u => u.userType?.toLowerCase() !== "admin"
            );
            setUsers(nonAdmin);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleView = (user) => {
        router.push(
            `/view_photos?id=${user.user_id}&email=${encodeURIComponent(
                user.email
            )}`
        );
    };

    const handleEdit = (user) => {
        router.push(`/edit-user?id=${user.user_id}`);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUserAdmin(id);
            setUsers((u) => u.filter((x) => x.user_id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete user.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="user-container">
                <h1 className="user-title">User Management</h1>

                <div className="user-top-bar">
                    <div className="user-controls">
                        <select
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                                <td>
                                    {user.subscriptionType === "Premium" ? "Yes" : "No"}
                                </td>
                                <td>{user.scanCount ?? 0}</td>
                                <td>
                                    <button
                                        className="view-btn"
                                        onClick={() => handleView(user)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(user)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(user.user_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="no-users">
                                    No users found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
