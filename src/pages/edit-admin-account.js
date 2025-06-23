import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AdminController } from '../controllers/AdminController';
import Navbar from '../components/Navbar';

export default function EditAdminAccount() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: ''
    });

    useEffect(() => {
        if (!router.isReady) return; // Wait until router is ready

        const { id } = router.query;
        const admin = AdminController.getAdminById(parseInt(id));

        if (admin) {
            setForm({
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                password: admin.password
            });
        }
    }, [router.isReady]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        AdminController.updateAdmin(parseInt(id), form);
        router.push('/admin-management');
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
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value="••••••"
                            disabled
                            readOnly
                            style={{ backgroundColor: '#e5e7eb', cursor: 'not-allowed' }}
                        />
                    </div>

                    <button type="submit" className="add-admin-btn">Update Admin</button>
                </form>
            </div>
        </>
    );
}