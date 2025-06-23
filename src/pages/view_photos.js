import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

export default function ViewPhotos() {
    const router = useRouter();
    const { email } = router.query;

    const dummyPhotos = [
        {
            id: 1,
            name: 'Water Bottle',
            type: 'object',
            photoUrl: 'https://via.placeholder.com/100',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        {
            id: 2,
            name: 'Receipt',
            type: 'text',
            photoUrl: 'https://via.placeholder.com/100',
            audioUrl: ''
        }
    ];

    const handleEdit = (id) => alert(`Edit photo ID ${id}`);
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this photo?')) {
            alert(`Deleted photo ID ${id}`);
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
                            <th>Photo</th>
                            <th>Audio</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dummyPhotos.map(photo => (
                            <tr key={photo.id}>
                                <td>{photo.id}</td>
                                <td>{photo.name}</td>
                                <td>{photo.type}</td>
                                <td><img src={photo.photoUrl} alt="photo" className="photo-thumb" /></td>
                                <td>
                                    {photo.audioUrl ? (
                                        <audio controls src={photo.audioUrl}></audio>
                                    ) : 'No audio'}
                                </td>
                                <td className="action-buttons">
                                    <button className="edit-btn" onClick={() => handleEdit(photo.id)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(photo.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}