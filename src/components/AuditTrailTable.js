import React, { useEffect, useMemo, useState } from 'react';
import { getAuditTrail } from '../services/apiService';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { shortenId } from '../utils/stringUtils';
import styles from '../styles/AuditTrailTable.module.css';
import filterStyles from '../styles/AuditTrailFilters.module.css';

export default function AuditTrailTable() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [newRowIds, setNewRowIds] = useState(new Set());
    const [sorting, setSorting] = useState([]);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState(new Date());
    const [deviceTypeFilter, setDeviceTypeFilter] = useState('All');
    const [deviceModelFilter, setDeviceModelFilter] = useState('All');
    const [actionFilter, setActionFilter] = useState('All');
    const [ipAddressFilter, setIpAddressFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchAuditTrail = async () => {
        if (!startDate || !endDate) {
            setError('Please select both a start and end date.');
            return;
        }
        try {
            setError(null);
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
            const data = await getAuditTrail(startDate.toISOString(), adjustedEndDate.toISOString());
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch audit trail:', err);
            setError('Could not load logs.');
        }
    };

    useEffect(() => {
        fetchAuditTrail();

        const fetchLatest = async () => {
            try {
                const data = await getAuditTrail(undefined, undefined);
                if (Array.isArray(data)) {
                    setLogs(prevLogs => {
                        const existingLogIds = new Set(prevLogs.map(log => log.audit_id));
                        const newLogs = data.filter(log => !existingLogIds.has(log.audit_id));

                        if (newLogs.length > 0) {
                            const newIds = new Set(newLogs.map(log => log.audit_id));
                            setNewRowIds(newIds);

                            // Remove the highlight after 2 seconds
                            setTimeout(() => {
                                setNewRowIds(prev => {
                                    const next = new Set(prev);
                                    newIds.forEach(id => next.delete(id));
                                    return next;
                                });
                            }, 2000);

                            const updatedLogs = [...newLogs, ...prevLogs];
                            updatedLogs.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
                            return updatedLogs;
                        }

                        return prevLogs;
                    });
                }
            } catch (error) {
                console.error("Error polling for audit data:", error);
            }
        };

        const interval = setInterval(fetchLatest, 1000);
        return () => clearInterval(interval);
    }, []);

    const columns = useMemo(() => [
        {
            accessorKey: 'audit_id',
            header: 'Audit ID',
            cell: info => shortenId(info.getValue())
        },
        {
            accessorKey: 'changedAt',
            header: 'Timestamp',
            cell: info => new Date(info.getValue()).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        },
        {
            accessorKey: 'changed_by',
            header: 'User',
            cell: info => info.getValue()
        },
        {
            accessorKey: 'action',
            header: 'Action'
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ getValue }) => {
                const status = getValue();
                const statusClass = status.toLowerCase() === 'success' ? styles.statusSuccess : styles.statusFail;
                return <span className={`${styles.status} ${statusClass}`}>{status}</span>;
            }
        },
        {
            accessorKey: 'ip_address',
            header: 'IP Address'
        },
        {
            accessorKey: 'user_agent',
            header: 'User Agent & Device Info'
        }
        // {
        //     accessorKey: 'request_body',
        //     header: 'Request Body'
        // }
    ], []);

    const extractDeviceInfo = (userAgent) => {
        const match = userAgent.match(/Device Model: (.*?),\s*Device Type: (.*?)\)/);
        if (match) {
            return { deviceModel: match[1], deviceType: match[2] };
        }
        return { deviceModel: 'Unknown', deviceType: 'Unknown' };
    };

    const deviceTypes = useMemo(() => {
        const types = new Set(logs.map(log => extractDeviceInfo(log.user_agent).deviceType));
        return ['All', ...Array.from(types)];
    }, [logs]);

    const deviceModels = useMemo(() => {
        const models = new Set(logs.map(log => extractDeviceInfo(log.user_agent).deviceModel));
        return ['All', ...Array.from(models)];
    }, [logs]);

    const actions = useMemo(() => {
        const actionSet = new Set(logs.map(log => log.action));
        return ['All', ...Array.from(actionSet)];
    }, [logs]);

    const ipAddresses = useMemo(() => {
        const ipSet = new Set(logs.map(log => log.ip_address));
        return ['All', ...Array.from(ipSet)];
    }, [logs]);

    const statuses = useMemo(() => {
        const statusSet = new Set(logs.map(log => log.status));
        return ['All', ...Array.from(statusSet)];
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const { deviceModel, deviceType } = extractDeviceInfo(log.user_agent);
            const typeMatch = deviceTypeFilter === 'All' || deviceType === deviceTypeFilter;
            const modelMatch = deviceModelFilter === 'All' || deviceModel === deviceModelFilter;
            const actionMatch = actionFilter === 'All' || log.action === actionFilter;
            const ipMatch = ipAddressFilter === 'All' || log.ip_address === ipAddressFilter;
            const statusMatch = statusFilter === 'All' || log.status === statusFilter;
            return typeMatch && modelMatch && actionMatch && ipMatch && statusMatch;
        });
    }, [logs, deviceTypeFilter, deviceModelFilter, actionFilter, ipAddressFilter, statusFilter]);

    const table = useReactTable({
        data: filteredLogs,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center mb-2">
                <h4 className="mb-0">Audit Trail</h4>
                <span className="badge bg-success ms-2">Live</span>
            </div>
            <p className="text-muted mb-3 fst-italic">Note: This is a Live Audit. New logs will appear automatically.</p>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className={filterStyles.filterControls}>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="startDate" className={filterStyles.filterLabel}>Start Date:</label>
                    <DatePicker
                        id="startDate"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        className={filterStyles.datePicker}
                        dateFormat="MM/dd/yyyy"
                        aria-label="Start Date"
                    />
                </div>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="endDate" className={filterStyles.filterLabel}>End Date:</label>
                    <DatePicker
                        id="endDate"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        className={filterStyles.datePicker}
                        dateFormat="MM/dd/yyyy"
                        aria-label="End Date"
                    />
                </div>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="pageSize" className={filterStyles.filterLabel}>Show</label>
                    <select
                        id="pageSize"
                        className={filterStyles.select}
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                        aria-label="Page size"
                    >
                        {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span className={filterStyles.filterLabel}>entries</span>
                </div>
                <button className={filterStyles.searchButton} onClick={fetchAuditTrail}>Filter</button>
            </div>

            <div className={filterStyles.filterControls}>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="deviceType" className={filterStyles.filterLabel}>Device Type:</label>
                    <select
                        id="deviceType"
                        className={filterStyles.select}
                        value={deviceTypeFilter}
                        onChange={e => setDeviceTypeFilter(e.target.value)}
                        aria-label="Device Type"
                    >
                        {deviceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="deviceModel" className={filterStyles.filterLabel}>Device Model:</label>
                    <select
                        id="deviceModel"
                        className={filterStyles.select}
                        value={deviceModelFilter}
                        onChange={e => setDeviceModelFilter(e.target.value)}
                        aria-label="Device Model"
                    >
                        {deviceModels.map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                </div>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="actionFilter" className={filterStyles.filterLabel}>Action:</label>
                    <select
                        id="actionFilter"
                        className={filterStyles.select}
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                        aria-label="Action"
                    >
                        {actions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="ipAddressFilter" className={filterStyles.filterLabel}>IP Address:</label>
                    <select
                        id="ipAddressFilter"
                        className={filterStyles.select}
                        value={ipAddressFilter}
                        onChange={e => setIpAddressFilter(e.target.value)}
                        aria-label="IP Address"
                    >
                        {ipAddresses.map(ip => (
                            <option key={ip} value={ip}>{ip}</option>
                        ))}
                    </select>
                </div>
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="statusFilter" className={filterStyles.filterLabel}>Status:</label>
                    <select
                        id="statusFilter"
                        className={filterStyles.select}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        aria-label="Status"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className={styles.table}>
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() === 'asc'
                                        ? ' 🔼'
                                        : header.column.getIsSorted() === 'desc'
                                            ? ' 🔽'
                                            : ''}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr
                            key={row.id}
                            className={newRowIds.has(row.original.audit_id) ? styles.newRow : ''}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="text-center">No logs found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        Showing {table.getRowModel().rows.length} of {filteredLogs.length} entries
                    </div>
                    <div className="d-flex">
                        <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            &laquo; Previous
                        </button>
                        {Array.from({ length: table.getPageCount() }, (_, i) => (
                            <button
                                key={i}
                                className={`btn btn-sm ${table.getState().pagination.pageIndex === i ? 'btn-primary' : 'btn-outline-primary'} me-1`}
                                onClick={() => table.setPageIndex(i)}
                            >
                                {i + 1}
                            </button>
                        )).slice(0, 5)}
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next &raquo;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
