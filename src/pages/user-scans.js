import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    getUserScansAdmin,
    deleteScanAdmin,
    getImageByConversationId
} from "../services/apiService";
import Navbar from "../components/Navbar";

export default function UserScans() {
    const router = useRouter();
    const { id, email } = router.query;

    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    useEffect(() => {
        if (id) fetchScans();
    }, [id]);

    const fetchScans = async () => {
        setLoading(true);
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

    const handleDeleteScan = async (scanId) => {
        if (!confirm("Are you sure you want to delete this scan?")) return;
        try {
            await deleteScanAdmin(scanId);
            setScans((prev) =>
                prev.filter((s) => s.scanId !== scanId && s.conversationId !== scanId)
            );
        } catch (err) {
            console.error("Failed to delete scan:", err);
            alert("Error deleting scan.");
        }
    };

    const fetchImageAndShow = async (conversationId) => {
        try {
            const { image } = await getImageByConversationId(conversationId);
            console.log("🖼 Received base64 image:", image?.substring(0, 50));
            if (image) {
                setSelectedImage(image);
            } else {
                alert("Image not found.");
            }
        } catch (err) {
            console.error("Failed to fetch image", err);
            alert("Error loading image.");
        }
    };

    const closeModal = () => setSelectedImage(null);

    const isNonImageScan = (type) => {
        const nonImageTypes = ["ocr", "text"];
        return nonImageTypes.includes(type?.toLowerCase());
    };

    const paginatedScans = scans.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );
    const totalPages = Math.ceil(scans.length / entriesPerPage);

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
                        Scans for: <strong>{email}</strong>
                    </h2>
                    <div />
                </div>

                {loading ? (
                    <p>Loading scans...</p>
                ) : scans.length === 0 ? (
                    <p>No scans found for this user.</p>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-bordered text-center">
                                <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name / Message</th>
                                    <th>Text</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedScans.map((scan, idx) => {
                                    const scanId =
                                        scan.scanId || scan.conversationId || idx;
                                    return (
                                        <tr key={scanId}>
                                            <td>{scanId}</td>
                                            <td>
                                                {scan.name ||
                                                    scan.first_user_message?.slice(0, 30) ||
                                                    "N/A"}
                                            </td>
                                            <td>
                                                {scan.text ||
                                                    scan.first_assistant_message?.slice(0, 30) ||
                                                    "N/A"}
                                            </td>
                                            <td>{scan.type || "N/A"}</td>
                                            <td>
                                                {new Date(scan.createdAt).toLocaleString()}
                                            </td>
                                            <td>
                                                {!isNonImageScan(scan.type) &&
                                                    scan.conversationId && (
                                                        <button
                                                            className="btn btn-info btn-sm me-2"
                                                            onClick={() =>
                                                                fetchImageAndShow(
                                                                    scan.conversationId
                                                                )
                                                            }
                                                        >
                                                            View Image
                                                        </button>
                                                    )}
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        handleDeleteScan(
                                                            scan.scanId ||
                                                            scan.conversationId
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    &lt;
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`btn btn-sm ${
                                            currentPage === p
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </>
                )}

                {selectedImage && (
                    <div
                        className="modal show d-block"
                        tabIndex="-1"
                        role="dialog"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
                    >
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Scanned Image</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeModal}
                                    ></button>
                                </div>
                                <div className="modal-body text-center">
                                    <img
                                        src={`data:image/png;base64,${selectedImage}`}
                                        alt="Scanned"
                                        style={{ maxWidth: "100%", height: "auto" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
