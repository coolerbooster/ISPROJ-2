import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import $ from "jquery";
import Navbar from "../components/Navbar";
import { getUserLogs } from "../services/apiService";

export default function UserLogsPage() {
    const router = useRouter();
    const { isReady, query } = router;

    const [logs, setLogs] = useState([]);
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isReady) return;

        const { userId, email } = query;
        if (!userId) return;

        setEmail(email);
        fetchLogs(userId);
    }, [isReady, query]);

    useEffect(() => {
        if (logs.length > 0) {
            if ($.fn.DataTable.isDataTable("#logsTable")) {
                $("#logsTable").DataTable().destroy();
            }
            $("#logsTable").DataTable();
        }
        return () => {
            if ($.fn.DataTable.isDataTable("#logsTable")) {
                $("#logsTable").DataTable().destroy();
            }
        };
    }, [logs]);

    const fetchLogs = async (userId) => {
        try {
            const data = await getUserLogs(userId);
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
            setError("Could not load user logs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => router.push("/user-management")}
                    >
                        ← Back
                    </button>
                    <h2 className="mb-0">
                        Logs for: <strong>{email || "Unknown User"}</strong>
                    </h2>
                    <div />
                </div>

                {loading ? (
                    <p>Loading logs...</p>
                ) : logs.length === 0 ? (
                    <p>No logs found for this user.</p>
                ) : (
                    <div className="table-responsive">
                        <table id="logsTable" className="table table-bordered text-center">
                            <thead className="table-light">
                            <tr>
                                <th>Method</th>
                                <th>Table</th>
                                <th>Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {logs.map((log, i) => (
                                <tr key={i}>
                                    <td>{log.method || "-"}</td>
                                    <td>{log.endpoint || "-"}</td>
                                    <td>{log.changedAt ? new Date(log.changedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
        </>
    );
}