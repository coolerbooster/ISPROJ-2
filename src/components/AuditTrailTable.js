import React, { useEffect, useState, useRef } from 'react';
import { getAuditTrail } from '../services/apiService';
import $ from 'jquery';
import { shortenId } from '../utils/stringUtils';

export default function AuditTrailTable() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const tableRef = useRef(null);

    const fetchAuditTrail = async () => {
        if (!startDate || !endDate) {
            setError('Please select both a start and end date.');
            return;
        }
        try {
            setError(null);
            const data = await getAuditTrail(startDate, endDate, searchTerm || '');
            console.log('Audit trail data from API:', data);
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch audit trail:', err);
            setError('Could not load logs.');
        }
    };

    const handleSearch = () => {
        fetchAuditTrail();
    };

    useEffect(() => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchAuditTrail();
        }
    }, [startDate, endDate]);

    useEffect(() => {
        // Destroy previous instance if it exists
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
            $(tableRef.current).DataTable().destroy();
        }

        // Initialize DataTable with data
        const table = $(tableRef.current).DataTable({
            data: logs,
            columns: [
                { data: 'changedAt', title: 'Date & Time', render: (data) => new Date(data).toLocaleString('en-US', { timeZone: 'Asia/Manila' }) },
                { data: 'user_email', title: 'User', render: (data, type, row) => data || (row.changed_by ? `ID: ${shortenId(row.changed_by)}` : 'N/A') },
                { data: 'action', title: 'Action Description' },
                { data: 'status', title: 'Status', render: (data) => `<span class="badge ${data === 'SUCCESS' ? 'bg-success' : 'bg-danger'}">${data}</span>` },
                { data: 'ip_address', title: 'IP Address' },
                { data: 'user_agent', title: 'Device', render: (data) => data ? (data.includes('Mobi') ? 'Mobile' : 'Desktop') : '-' }
            ],
            order: [[0, 'desc']],
            destroy: true,
        });

        return () => {
            if ($.fn.DataTable.isDataTable(tableRef.current)) {
                table.destroy();
            }
        };
    }, [logs]);

    return (
        <div className="container-fluid py-4">
            <h3 className="mb-4">Audit Trail</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row mb-3">
                <div className="col-md-3">
                    <label>Start Date</label>
                    <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <label>End Date</label>
                    <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <label>Search</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by user, action, or IP"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-primary w-100" onClick={handleSearch}>Filter</button>
                </div>
            </div>

            <div className="table-responsive">
                <table ref={tableRef} id="auditTrailTable" className="table table-striped table-bordered" style={{ width: "100%" }}>
                    {/* The thead and tbody will be managed by DataTables */}
                    <thead className="table-light"></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    );
}