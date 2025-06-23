import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from 'next/router';

const dummyUsers = [
    {
        id: 101,
        email: "jane@example.com",
        password: "123456",
        userType: "user",
        subscriptionType: "free",
        scanCount: 10,
        guardianMode: "No",
        photoUrl: "https://via.placeholder.com/150",
        voiceMessageUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        id: 102,
        email: "john@example.com",
        password: "654321",
        userType: "guardian",
        subscriptionType: "",
        scanCount: 42,
        guardianMode: "Yes",
        photoUrl: "https://via.placeholder.com/150",
        voiceMessageUrl: ""
    }
];

export default function UserManagement() {
    const [users, setUsers] = useState(dummyUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [editingUser, setEditingUser] = useState(null);
    const router = useRouter();

    const handleEdit = (user) => setEditingUser({ ...user });
    const handleView = (user) => {
        router.push(`/view_photos?id=${user.id}`);
    };
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter((u) => u.id !== id));
        }
    };

    const handleSaveEdit = (updatedUser) => {
        if (!updatedUser.email.trim() || !updatedUser.password.trim()) return;
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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
                        <th>User Type</th>
                        <th>Subscription</th>
                        <th>Scan Count</th>
                        <th>Guardian Mode</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.slice(0, entriesPerPage).map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.userType}</td>
                            <td>{user.subscriptionType || "-"}</td>
                            <td>{user.scanCount}</td>
                            <td>{user.guardianMode}</td>
                            <td>
                                <button className="view-btn" onClick={() => handleView(user)}>View</button>
                                <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                                <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan="7" className="no-users">No users found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {editingUser && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <h2>Edit {editingUser.userType === "guardian" ? "Guardian" : "User"}</h2>

                            <div className="form-row">
                                <label>Email:</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) =>
                                        setEditingUser({ ...editingUser, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <label>Password:</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    value={editingUser.password || ""}
                                    onChange={(e) =>
                                        setEditingUser({ ...editingUser, password: e.target.value })
                                    }
                                />
                            </div>

                            {editingUser.userType === "user" && (
                                <div className="form-row">
                                    <label>Subscription Type:</label>
                                    <select
                                        className="input-field"
                                        value={editingUser.subscriptionType}
                                        onChange={(e) =>
                                            setEditingUser({ ...editingUser, subscriptionType: e.target.value })
                                        }
                                    >
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ marginTop: "1rem" }}>
                                <button
                                    className="view-btn"
                                    disabled={!editingUser.email.trim() || !editingUser.password.trim()}
                                    onClick={() => handleSaveEdit(editingUser)}
                                >
                                    Save
                                </button>
                                <button className="modal-close" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}