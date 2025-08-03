import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { listGuardians, getGuardianBoundUsers } from '../services/apiService';
import { shortenId } from '../utils/stringUtils';

export default function GuardianList() {
    const [guardians, setGuardians] = useState([]);
    const [expandedGuardian, setExpandedGuardian] = useState(null);

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

    const toggleGuardian = (guardianId) => {
        setExpandedGuardian(expandedGuardian === guardianId ? null : guardianId);
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
                                        </td>
                                    </tr>
                                    {expandedGuardian === guardian.user_id && (
                                        <tr>
                                            <td colSpan="3">
                                                <div className="p-3">
                                                    <h5>Bound Users</h5>
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
        </>
    );
}
