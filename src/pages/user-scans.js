import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUserScansAdmin, deleteScanAdmin } from "../services/apiService";
import Navbar from "../components/Navbar";

export default function UserScans() {
    const router = useRouter();
    const { id, email } = router.query;

    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchScans = async () => {
            try {
                const res = await getUserScansAdmin(id);
                const scanList = Array.isArray(res.data) ? res.data : res;
                setScans(scanList);
            } catch (err) {
                console.error("Failed to fetch scans:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, [id]);

    const handleDeleteScan = async (scanId) => {
        if (!confirm("Are you sure you want to delete this scan?")) return;

        try {
            await deleteScanAdmin(scanId);
            setScans((prev) => prev.filter((s) => s.scanId !== scanId));
        } catch (err) {
            console.error("Failed to delete scan:", err);
            alert("Error deleting scan.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <h2 className="mb-3">
                    Scans for: <strong>{email}</strong>
                </h2>

                {loading ? (
                    <p>Loading scans...</p>
                ) : scans.length === 0 ? (
                    <p>No scans found for this user.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered text-center">
                            <thead className="table-light">
                            <tr>
                                <th>Scan ID</th>
                                <th>Name</th>
                                <th>Text</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {scans.map((scan) => (
                                <tr key={scan.scanId}>
                                    <td>{scan.scanId}</td>
                                    <td>{scan.name || "N/A"}</td>
                                    <td>{scan.text || "N/A"}</td>
                                    <td>{scan.type || "N/A"}</td>
                                    <td>{new Date(scan.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteScan(scan.scanId)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
