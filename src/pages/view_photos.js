import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { getUserScansAdmin } from '../services/apiService';

export default function ViewPhotos() {
    const router = useRouter();
    const { id, email } = router.query;

    const [scans, setScans] = useState([]);

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

    const handleEdit = (scanId) => alert(`Edit scan ID ${scanId}`);
    const handleDelete = (scanId) => {
        if (confirm('Are you sure you want to delete this scan?')) {
            alert(`Deleted scan ID ${scanId}`);
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
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Image</th>
                            <th>Audio</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scans.map((scan) => (
                            <tr key={scan.scan_id}>
                                <td>{scan.scan_id}</td>
                                <td>{scan.name || '(Untitled)'}</td>
                                <td>{scan.type}</td>
                                <td>
                                    {scan.imageUrl ? (
                                        <img src={scan.imageUrl} alt="Scan" className="photo-thumb" />
                                    ) : 'No image'}
                                </td>
                                <td>
                                    {scan.audioUrl ? (
                                        <audio controls src={scan.audioUrl}></audio>
                                    ) : 'No audio'}
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEdit(scan.scan_id)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(scan.scan_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {scans.length === 0 && (
                            <tr>
                                <td colSpan="6">No scans found for this user.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}