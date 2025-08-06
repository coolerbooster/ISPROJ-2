import React, { useEffect, useMemo, useState } from 'react';
import { getAuditTrail } from '../services/apiService';
import { shortenId } from '../utils/stringUtils';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';

// Helper to parse UTC timestamp string and format as Philippines local time in 12-hour format
const formatPHDateTime = (value) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    // Check if the created date is valid before attempting to format it.
    if (isNaN(date.getTime())) {
        // Fallback for date strings with a space instead of a 'T' separator.
        const isoString = value.replace(' ', 'T') + 'Z';
        const fallbackDate = new Date(isoString);
        if (isNaN(fallbackDate.getTime())) {
            console.error('Invalid date value received:', value);
            return 'Invalid Date';
        }
        return fallbackDate.toLocaleString('en-PH', {
            timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: '2-digit',
            day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }

    return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        hour12: true,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

export default function AuditTrailTable() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const todayISO = (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();

    const tomorrowISO = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();

    const fetchAuditTrail = async () => {
        if (!startDate || !endDate) {
            setError('Please select both a start and end date.');
            return;
        }

        try {
            setError(null);
            const data = await getAuditTrail(startDate, endDate, searchTerm);
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
        const toYYYYMMDD = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        setStartDate(toYYYYMMDD(sevenDaysAgo));
        setEndDate(toYYYYMMDD(tomorrow));
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchAuditTrail();
        }
    }, [startDate, endDate]);

    const columns = useMemo(() => [
        {
            accessorKey: 'changedAt',
            header: 'Date & Time',
            cell: info => formatPHDateTime(info.getValue())
        },
        {
            accessorKey: 'user_email',
            header: 'User',
            cell: ({ row }) =>
                row.original.user_email || (row.original.changed_by
                    ? `ID: ${shortenId(row.original.changed_by)}`
                    : 'N/A')
        },
        {
            accessorKey: 'action',
            header: 'Action Description'
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: info => (
                <span
                    className={`badge ${info.getValue() === 'SUCCESS' ? 'bg-success' : 'bg-danger'}`}
                >
                    {info.getValue()}
                </span>
            )
        },
        {
            accessorKey: 'ip_address',
            header: 'IP Address'
        },
        {
            accessorKey: 'user_agent',
            header: 'Device',
            cell: info => {
                const val = info.getValue();
                return val ? (val.includes('Mobi') ? 'Mobile' : 'Desktop') : '-';
            }
        }
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

            <div className="row mb-3">
                <div className="col-md-3">
                    <label>Start Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        max={todayISO}
                    />
                </div>
                <div className="col-md-3">
                    <label>End Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        max={tomorrowISO}
                    />
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
                    <button className="btn btn-primary w-100" onClick={handleSearch}>
                        Filter
                    </button>
                </div>
            </div>

            <div className="d-flex justify-content-between mb-3">
                <div className="d-flex align-items-center">
                    <label className="me-2">Show</label>
                    <select
                        className="form-select"
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                    >
                        {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span className="ms-2">entries</span>
                </div>
                <div className="d-flex align-items-center">
                    <label className="me-2">Search:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder={`${logs.length} records...`}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-light">
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
