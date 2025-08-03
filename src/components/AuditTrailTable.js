import React, { useEffect, useState } from 'react';
import { getAuditTrail } from '../services/apiService';
import $ from 'jquery';
import { shortenId } from '../utils/stringUtils';

export default function AuditTrailTable() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuditTrail = async () => {
            try {
                const today = new Date();
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);

                const startDate = sevenDaysAgo.toISOString().split('T')[0];
                const endDate = today.toISOString().split('T')[0];

                const data = await getAuditTrail(startDate, endDate);
                console.log("📄 RAW LOGS:", data);
                setLogs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch audit trail:', err);
                setError('Could not load logs.');
            }
        };

        fetchAuditTrail();
    }, []);

    useEffect(() => {
        if (logs.length > 0) {
            if ($.fn.DataTable.isDataTable("#auditTrailTable")) {
                $("#auditTrailTable").DataTable().destroy();
            }
            $("#auditTrailTable").DataTable();
        }
        return () => {
            if ($.fn.DataTable.isDataTable("#auditTrailTable")) {
                $("#auditTrailTable").DataTable().destroy();
            }
        };
    }, [logs]);

    return (
        <div className="container py-4">
            <h3 className="mb-4">Audit Trail Logs (Past 7 Days)</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-responsive">
                <table id="auditTrailTable" className="table table-bordered text-center">
                    <thead className="table-light">
                    <tr>
                        <th>Method</th>
                        <th>User ID</th>
                        <th>Table</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <tr key={index}>
                                <td>{log.method || '-'}</td>
                                <td>{shortenId(log.changed_by) || '-'}</td>
                                <td>{log.endpoint || '-'}</td>
                                <td>{log.changedAt ? new Date(log.changedAt).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-muted">No logs found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}