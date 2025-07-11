import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { getUserScansAdmin, updateScanAdmin, deleteScanAdmin } from '../services/apiService';

export default function ViewPhotos() {
    const router = useRouter();
    const { id, email } = router.query;

    const [scans, setScans] = useState([]);
    const [selectedScan, setSelectedScan] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', type: '', text: '' });

    useEffect(() => {
        if (id) {
            fetchScans(id);
        }
    }, [id]);

    const fetchScans = async (userId) => {
        try {
            const data = await getUserScansAdmin(userId);
            setScans(data || []);
        } catch (err) {
            console.error("Failed to fetch scans", err);
        }
    };

    const openEditModal = (scan) => {
        setSelectedScan(scan);
        setEditForm({ name: scan.name || '', type: scan.type || 'Text', text: scan.text || '' });
    };

    const closeEditModal = () => {
        setSelectedScan(null);
        setEditForm({ name: '', type: '', text: '' });
    };

    const handleUpdate = async () => {
        try {
            if (!editForm.name || !editForm.type) {
                alert("Name and type are required.");
                return;
            }

            await updateScanAdmin(selectedScan.scanId, editForm.type, editForm.name, editForm.text);
            alert("Scan updated successfully");
            closeEditModal();
            fetchScans(id);
        } catch (err) {
            console.error("❌ Failed to update scan:", err);
            alert("Failed to update scan. " + err.message);
        }
    };

    const handleDelete = async (scanId) => {
        if (confirm('Are you sure you want to delete this scan?')) {
            try {
                await deleteScanAdmin(scanId);
                alert('Scan deleted');
                fetchScans(id);
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Failed to delete scan.');
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button className="btn btn-outline-primary" onClick={() => router.push('/user-management')}>
                        ← Back
                    </button>
                    <h2 className="fw-bold mb-0">
                        Latest Scan History of <u>{email || 'Unknown User'}</u>
                    </h2>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered table-hover text-center align-middle">
                        <thead className="table-light">
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Image</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scans.map((scan) => (
                            <tr key={scan.scanId}>
                                <td>{scan.name || '(Untitled)'}</td>
                                <td>{scan.type}</td>
                                <td>
                                    {scan.imageUrl ? (
                                        <img
                                            src={scan.imageUrl}
                                            alt="Scan"
                                            className="img-thumbnail"
                                            style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                                            onClick={() => window.open(scan.imageUrl, '_blank')}
                                        />
                                    ) : 'No image'}
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-primary me-2" onClick={() => openEditModal(scan)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(scan.scanId)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {scans.length === 0 && (
                            <tr>
                                <td colSpan="4">No scans found for this user.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedScan && (
                <div className="modal-overlay">
                    <div className="modal-content bg-white p-4 rounded shadow" style={{ width: '400px' }}>
                        <h5 className="fw-bold mb-3">Edit Scan</h5>

                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Type</label>
                            <select
                                className="form-select"
                                value={editForm.type}
                                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                            >
                                <option value="Text">Text</option>
                                <option value="Object">Object</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Text</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={editForm.text}
                                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                            />
                        </div>

                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success" onClick={handleUpdate}>Save</button>
                            <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1050;
                }
            `}</style>
        </>
    );
}