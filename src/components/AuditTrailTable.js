import React, { useEffect, useMemo, useState, useCallback, memo, useRef } from 'react';
import { getAuditTrail } from '../services/apiService';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { addDays, format } from 'date-fns';
import { shortenId } from '../utils/stringUtils';
import styles from '../styles/AuditTrailTable.module.css';
import filterStyles from '../styles/AuditTrailFilters.module.css';
import { FaCheckCircle, FaExclamationCircle, FaChevronDown, FaFilter, FaSearch, FaRedo } from 'react-icons/fa';

function AuditTrailTable() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newRowIds, setNewRowIds] = useState(new Set());
    const [sorting, setSorting] = useState([{ id: 'changedAt', desc: true }]);
    const [filters, setFilters] = useState({
        deviceType: 'All',
        deviceModel: 'All',
        action: 'All',
        ipAddress: 'All',
        status: 'All',
        dateRange: [{
            startDate: addDays(new Date(), -7),
            endDate: new Date(),
            key: 'selection'
        }]
    });
    const [showFilters, setShowFilters] = useState(true);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const dateRangeRef = useRef(null);

    const fetchAuditTrail = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { startDate, endDate } = filters.dateRange[0];
            const data = await getAuditTrail(startDate.toISOString(), addDays(endDate, 1).toISOString());
            setLogs(Array.isArray(data) ? data.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)) : []);
        } catch (err) {
            console.error('Failed to fetch audit trail:', err);
            setError('Could not load logs. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [filters.dateRange]);

    useEffect(() => {
        fetchAuditTrail();
    }, [fetchAuditTrail]);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                // Fetch all recent logs without date constraints to check for new ones
                const data = await getAuditTrail(); 
                if (Array.isArray(data)) {
                    setLogs(prevLogs => {
                        const existingLogIds = new Set(prevLogs.map(log => log.audit_id));
                        const newLogs = data.filter(log => !existingLogIds.has(log.audit_id));

                        if (newLogs.length > 0) {
                            console.log(`[AuditTrailTable] Adding ${newLogs.length} new log(s).`);

                            // Sort only the new logs before prepending
                            newLogs.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
                            
                            const newIds = new Set(newLogs.map(log => log.audit_id));
                            setNewRowIds(newIds);

                            setTimeout(() => {
                                setNewRowIds(prev => {
                                    const next = new Set(prev);
                                    newIds.forEach(id => next.delete(id));
                                    return next;
                                });
                            }, 500);

                            // Prepend new logs to avoid re-sorting the entire list
                            return [...newLogs, ...prevLogs];
                        }
                        return prevLogs;
                    });
                }
            } catch (error) {
                console.error("Error polling for audit data:", error);
            }
        };

        const interval = setInterval(fetchLatest, 500); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
                setShowDateRangePicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dateRangeRef]);

    const columns = useMemo(() => [
        {
            accessorKey: 'audit_id',
            header: 'Audit ID',
            cell: info => shortenId(info.getValue())
        },
        {
            accessorKey: 'changedAt',
            header: 'Timestamp',
            cell: info => format(new Date(info.getValue()), 'MM/dd/yyyy, hh:mm:ss a')
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
                const isSuccess = status.toLowerCase() === 'success';
                const statusClass = isSuccess ? styles.statusSuccess : styles.statusFail;
                const Icon = isSuccess ? FaCheckCircle : FaExclamationCircle;
                return (
                    <span className={`${styles.status} ${statusClass}`}>
                        <Icon />
                        {status}
                    </span>
                );
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
    ], []);

    const extractDeviceInfo = (userAgent) => {
        if (!userAgent) return { deviceModel: 'Unknown', deviceType: 'Unknown' };
        const match = userAgent.match(/Device Model: (.*?),\s*Device Type: (.*?)\)/);
        return match ? { deviceModel: match[1], deviceType: match[2] } : { deviceModel: 'Unknown', deviceType: 'Unknown' };
    };

    const filterOptions = useMemo(() => {
        const deviceTypes = new Set(logs.map(log => extractDeviceInfo(log.user_agent).deviceType));
        const deviceModels = new Set(logs.map(log => extractDeviceInfo(log.user_agent).deviceModel));
        const actions = new Set(logs.map(log => log.action));
        const ipAddresses = new Set(logs.map(log => log.ip_address));
        const statuses = new Set(logs.map(log => log.status));

        return {
            deviceType: ['All', ...Array.from(deviceTypes)],
            deviceModel: ['All', ...Array.from(deviceModels)],
            action: ['All', ...Array.from(actions)],
            ipAddress: ['All', ...Array.from(ipAddresses)],
            status: ['All', ...Array.from(statuses)],
        };
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const { deviceModel, deviceType } = extractDeviceInfo(log.user_agent);
            const { startDate, endDate } = filters.dateRange[0];
            const logDate = new Date(log.changedAt);
            
            const isDateInRange = logDate >= startDate && logDate <= addDays(endDate, 1);
            if (!isDateInRange) return false;

            return Object.keys(filters).every(key => {
                if (key === 'dateRange' || filters[key] === 'All') return true;
                if (key === 'deviceType') return deviceType === filters.deviceType;
                if (key === 'deviceModel') return deviceModel === filters.deviceModel;
                return String(log[key]) === String(filters[key]);
            });
        });
    }, [logs, filters]);

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
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (item) => {
        setFilters(prev => ({ ...prev, dateRange: [item.selection] }));
    };

    const applyFilters = () => {
        fetchAuditTrail(); // Re-fetch logs based on new date range and apply filters
    };

    const clearFilters = () => {
        const cleared = {
            deviceType: 'All',
            deviceModel: 'All',
            action: 'All',
            ipAddress: 'All',
            status: 'All',
            dateRange: [{
                startDate: addDays(new Date(), -7),
                endDate: new Date(),
                key: 'selection'
            }]
        };
        setFilters(cleared);
    };

    const renderFilterDropdown = (name, label) => (
        <div className={filterStyles.filterGroup}>
            <label htmlFor={name} className={filterStyles.filterLabel}>{label}:</label>
            <select
                id={name}
                name={name}
                className={filterStyles.select}
                value={filters[name]}
                onChange={handleFilterChange}
            >
                {filterOptions[name]?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
    
    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center mb-2">
                <h4 className="mb-0">Audit Trail</h4>
                <span className="badge bg-success ms-2">Live</span>
            </div>
            <p className="text-muted mb-3 fst-italic">This is a live feed of system activities. New logs appear automatically.</p>

            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className={filterStyles.filterContainer}>
                <div className={filterStyles.filterHeader} onClick={() => setShowFilters(!showFilters)}>
                    <h5 className={filterStyles.filterTitle}><FaFilter className="me-2"/>Filters</h5>
                    <FaChevronDown className={`${filterStyles.toggleIcon} ${!showFilters ? filterStyles.collapsed : ''}`} />
                </div>
                <div className={`${filterStyles.filterControls} ${!showFilters ? filterStyles.collapsed : ''}`}>
                    <div className={filterStyles.dateRangePickerGroup}>
                        <label className={filterStyles.filterLabel}>Date Range:</label>
                        <div className={filterStyles.datePickerInputContainer} ref={dateRangeRef}>
                            <input
                                type="text"
                                className={filterStyles.input}
                                style={{ cursor: 'pointer', backgroundColor: 'var(--white-color)' }}
                                readOnly
                                value={`${format(filters.dateRange[0].startDate, "MM/dd/yyyy")} - ${format(filters.dateRange[0].endDate, "MM/dd/yyyy")}`}
                                onClick={() => setShowDateRangePicker(prev => !prev)}
                            />
                            {showDateRangePicker && (
                                <div className={filterStyles.datePickerPopup}>
                                    <DateRange
                                        editableDateInputs={true}
                                        onChange={handleDateChange}
                                        moveRangeOnFirstSelection={false}
                                        ranges={filters.dateRange}
                                        months={1}
                                        direction="horizontal"
                                        showDateDisplay={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                   <div className={filterStyles.dropdownFilterGroup}>
                       <div className={filterStyles.dropdownsWrapper}>
                           {renderFilterDropdown('deviceType', 'Device Type')}
                           {renderFilterDropdown('deviceModel', 'Device Model')}
                           {renderFilterDropdown('action', 'Action')}
                           {renderFilterDropdown('ipAddress', 'IP Address')}
                           {renderFilterDropdown('status', 'Status')}
                       </div>
                       <div className={filterStyles.filterActions}>
                           <button onClick={clearFilters} className={`${filterStyles.actionButton} ${filterStyles.secondaryButton}`}>
                               <FaRedo className="me-1" /> Reset
                           </button>
                            <button onClick={applyFilters} className={`${filterStyles.actionButton} ${filterStyles.primaryButton}`}>
                                <FaSearch className="me-1" /> Apply
                            </button>
                        </div>
                   </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className={styles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">Loading...</td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-5">
                                    <h5>No logs found.</h5>
                                    <p>Try adjusting your filters or check back later.</p>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className={newRowIds.has(row.original.audit_id) ? styles.newRow : ''}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                    Showing {table.getRowModel().rows.length} of {filteredLogs.length} entries.
                    Page{' '}<strong>{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</strong>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>&laquo; First</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>&lsaquo; Previous</button>
                    <span className="d-flex align-items-center gap-1">
                        <input
                            type="number"
                            defaultValue={table.getState().pagination.pageIndex + 1}
                            onChange={e => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                table.setPageIndex(page);
                            }}
                            className="form-control form-control-sm"
                            style={{ width: '60px' }}
                        />
                    </span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next &rsaquo;</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last &raquo;</button>
                     <select
                        className="form-select form-select-sm"
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                        style={{ width: '100px' }}
                    >
                        {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>Show {size}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default memo(AuditTrailTable);
