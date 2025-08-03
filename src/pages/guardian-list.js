import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { listGuardians, getGuardianBoundUsers, deleteUser, updateUser, getUserById } from '../services/apiService';
import { shortenId } from '../utils/stringUtils';
import styles from '../styles/guardian-list.module.css';

export default function GuardianList() {
    const [guardians, setGuardians] = useState([]);
    const [expandedGuardian, setExpandedGuardian] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGuardian, setSelectedGuardian] = useState(null);
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState('');
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [scanCount, setScanCount] = useState(0);

    useEffect(() => {
        fetchGuardians();
    }, []);

    const fetchGuardians = async () => {
        try {
            const guardianList = await listGuardians();
            const guardiansWithBoundUsers = await Promise.all(
                guardianList.map(async (guardian) => {
                    const boundUsers = await getGuardianBoundUsers(guardian.user_id);
                    return { ...guardian, boundUsers };
                })
            );
            setGuardians(guardiansWithBoundUsers);
        } catch (error) {
            console.error('Error fetching guardians:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this guardian?')) {
            try {
                await deleteUser(userId);
                fetchGuardians();
            } catch (error) {
                console.error('Error deleting guardian:', error);
                alert('Failed to delete guardian.');
            }
        }
    };
 
    const toggleGuardian = (guardianId) => {
        setExpandedGuardian(expandedGuardian === guardianId ? null : guardianId);
    };

    const openEditModal = async (guardian) => {
        setSelectedGuardian(guardian);
        try {
            const guardianDetails = await getUserById(guardian.user_id);
            setEmail(guardianDetails.email);
            setAccountType(guardianDetails.userType);
            setIsPremiumUser(guardianDetails.subscriptionType === 'Premium');
            setScanCount(guardianDetails.scanCount || 0);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error fetching guardian details:', error);
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedGuardian(null);
        setEmail('');
        setAccountType('');
        setIsPremiumUser(false);
        setScanCount(0);
    };

    const handleUpdate = async () => {
        try {
            await updateUser(selectedGuardian.user_id, {
                email,
                accountType,
                isPremiumUser: accountType === 'Guardian' ? false : isPremiumUser,
                scanCount,
            });
            closeEditModal();
            fetchGuardians();
        } catch (error) {
            console.error('Error updating guardian:', error);
            alert('Failed to update guardian.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <h1 className="fw-bold mb-4">Guardian List</h1>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover text-center">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guardians.map((guardian) => (
                                <React.Fragment key={guardian.user_id}>
                                    <tr>
                                        <td>{shortenId(guardian.user_id)}</td>
                                        <td>{guardian.email}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => toggleGuardian(guardian.user_id)}
                                            >
                                                {expandedGuardian === guardian.user_id ? 'Hide Users' : 'Show Users'}
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm ms-2"
                                                onClick={() => openEditModal(guardian)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm ms-2"
                                                onClick={() => handleDelete(guardian.user_id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedGuardian === guardian.user_id && (
                                        <tr>
                                            <td colSpan="3">
                                                <div className="p-3">
                                                    <h5>Bound Users</h5>
                                                    {guardian.boundUsers.length > 0 ? (
                                                        <table className="table table-sm table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th>User ID</th>
                                                                    <th>Email</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {guardian.boundUsers.map((user) => (
                                                                    <tr key={user.user_id}>
                                                                        <td>{shortenId(user.user_id)}</td>
                                                                        <td>{user.email}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p>No users are bound to this guardian.</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Guardian</h5>
                                <button type="button" className="btn-close" onClick={closeEditModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="accountType" className="form-label">Account Type</label>
                                    <select
                                        id="accountType"
                                        className="form-select"
                                        value={accountType}
                                        onChange={(e) => setAccountType(e.target.value)}
                                    >
                                        <option value="Guardian">Guardian</option>
                                        <option value="User">User</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
