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
            fetchScans(id); // reload updated scans
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
            <div className="photo-container">
                <div className="photo-header">
                    <button className="back-btn" onClick={() => router.push('/user-management')}>
                        ← Back
                    </button>
                    <h2 className="photo-title">
                        Latest Scan History of <u>{email || 'Unknown User'}</u>
                    </h2>
                </div>

                <div className="photo-table-container">
                    <table className="photo-table">
                        <thead>
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
                                            className="photo-thumb"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => window.open(scan.imageUrl, '_blank')}
                                        />
                                    ) : 'No image'}
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => openEditModal(scan)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(scan.scanId)}>Delete</button>
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
                    <div className="modal">
                        <h3>Edit Scan</h3>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                        <label>Type:</label>
                        <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        >
                            <option value="Text">Text</option>
                            <option value="Object">Object</option>
                        </select>
                        <label>Text:</label>
                        <textarea
                            rows={3}
                            value={editForm.text}
                            onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleUpdate}>Save</button>
                            <button className="cancel" onClick={closeEditModal}>Cancel</button>
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
                    z-index: 1000;
                }
                .modal {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    width: 400px;
                }
                .modal h3 {
                    margin-top: 0;
                }
                .modal label {
                    display: block;
                    margin-top: 1rem;
                    font-weight: bold;
                }
                .modal input,
                .modal select,
                .modal textarea {
                    width: 100%;
                    padding: 0.5rem;
                    margin-top: 0.25rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .modal-buttons {
                    margin-top: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                }
                .modal-buttons button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .modal-buttons .cancel {
                    background: #ccc;
                }
            `}</style>
        </>
    );
}
