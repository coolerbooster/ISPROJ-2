import React, { useEffect, useState } from "react";
import { getAuditTrail } from "../services/apiService";
import { useRouter } from "next/router";

export default function AuditTrail() {
    const [logs, setLogs] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        const now = new Date();
        const endDate = now.toISOString().split('T')[0];
        const startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];

        try {
            const res = await getAuditTrail(startDate, endDate);
            console.log("🔍 RAW AUDIT LOG RESPONSE:", res);
            setLogs(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error("❌ Error fetching audit logs:", err.message);
        }
    }

    return (
        <div className="p-6 flex flex-col items-center">
            <div className="w-full max-w-screen-xl">
                <button
                    onClick={() => router.back()}
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold mb-4 text-left">Audit Trail</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 text-sm text-center">
                        <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase leading-normal">
                            <th className="py-3 px-4 border">Action</th>
                            <th className="py-3 px-4 border">User ID</th>
                            <th className="py-3 px-4 border">Table</th>
                            <th className="py-3 px-4 border">Field</th>
                            <th className="py-3 px-4 border">Old Value</th>
                            <th className="py-3 px-4 border">New Value</th>
                            <th className="py-3 px-4 border">Changed At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    No logs found.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, index) => (
                                <tr key={index} className="border-t border-gray-200">
                                    <td className="py-2 px-4 border">{log.method || '-'}</td>
                                    <td className="py-2 px-4 border">{log.changed_by || '-'}</td>
                                    <td className="py-2 px-4 border">{log.endpoint || '-'}</td>
                                    <td className="py-2 px-4 border">{log.field || '-'}</td>
                                    <td className="py-2 px-4 border">{log.old_value || '-'}</td>
                                    <td className="py-2 px-4 border">{log.new_value || '-'}</td>
                                    <td className="py-2 px-4 border">
                                        {log.changedAt
                                            ? new Date(log.changedAt).toLocaleString()
                                            : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
