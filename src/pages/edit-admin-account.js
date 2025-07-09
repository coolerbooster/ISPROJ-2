import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AdminController } from '../controllers/AdminController';
import Navbar from '../components/Navbar';

export default function EditAdminAccount() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        if (!router.isReady) return;

        const fetchAdmin = async () => {
            const { id } = router.query;
            try {
                const admin = await AdminController.getAdminById(parseInt(id));
                if (admin) {
                    setForm({
                        email: admin.email,
                        password: ''
                    });
                }
            } catch (err) {
                console.error('Failed to load admin:', err);
                alert('Failed to load admin data');
            }
        };

        fetchAdmin();
    }, [router.isReady]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { id } = router.query;

        try {
            await AdminController.updateAdminPassword(id, form.password);
            alert('Password updated successfully.');
            router.push('/admin-management');
        } catch (error) {
            console.error(error);
            alert('Failed to update password.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="admin-container">
                <button className="add-admin-btn" onClick={() => router.back()}>← Back</button>
                <h2>Edit Admin Account</h2>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            disabled
                            readOnly
                            style={{ backgroundColor: '#e5e7eb', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="add-admin-btn">Update Password</button>
                </form>
            </div>
        </>
    );
}