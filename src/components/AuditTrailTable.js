import React, { useEffect, useState } from 'react';
import { getAuditTrail } from '../services/apiService';

export default function AuditTrailTable() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchAuditTrail = async () => {
            try {
                const data = await getAuditTrail();
                setLogs(data);
            } catch (err) {
                console.error('Failed to fetch audit trail:', err);
            }
        };

        fetchAuditTrail();
    }, []);

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Audit Trail</h3>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead className="table-light">
                    <tr>
                        <th>User ID</th>
                        <th>Activity</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.userId}</td>
                            <td>{log.activity}</td>
                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}