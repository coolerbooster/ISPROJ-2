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
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState(new Date());

    const fetchAuditTrail = async () => {
        if (!startDate || !endDate) {
            setError('Please select both a start and end date.');
            return;
        }
        try {
            setError(null);
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
            const data = await getAuditTrail(startDate.toISOString(), adjustedEndDate.toISOString(), globalFilter);
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch audit trail:', err);
            setError('Could not load logs.');
        }
    };

    useEffect(() => {
        fetchAuditTrail();
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
                const statusClass = status === 'success' ? styles.statusSuccess : styles.statusFail;
                return <span className={`${styles.status} ${statusClass}`}>{status}</span>;
            }
        },
        {
            accessorKey: 'ip_address',
            header: 'IP Address'
        },
        {
            accessorKey: 'user_agent',
            header: 'User Agent'
        }
        // {
        //     accessorKey: 'request_body',
        //     header: 'Request Body'
        // }
    ], []);

    const table = useReactTable({
        data: logs,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="container-fluid py-4">
            <p className="text-muted mb-3">Showing {logs.length} log{logs.length !== 1 ? 's' : ''}</p>

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
                <div className={filterStyles.filterGroup}>
                    <label htmlFor="search" className={filterStyles.filterLabel}>Search:</label>
                    <input
                        id="search"
                        type="text"
                        className={filterStyles.input}
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder={`${logs.length} records...`}
                        aria-label="Search logs"
                    />
                </div>
                <button className={filterStyles.searchButton} onClick={fetchAuditTrail}>Filter</button>
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
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="text-center">No logs found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        Showing {table.getRowModel().rows.length} of {logs.length} entries
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
