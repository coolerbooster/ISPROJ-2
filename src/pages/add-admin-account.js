import { useState } from 'react';
import { useRouter } from 'next/router';
import { AdminController } from '../controllers/AdminController';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function AddAdminPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            await AdminController.createAdmin(form);
            router.push('/admin-management');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="add-admin-page">
                <div className="back-button-container">
                    <Link href="/admin-management" legacyBehavior>
                        <a className="back-button">← Back</a>
                    </Link>
                </div>

                <div className="form-box">
                    <h1 className="form-title">Add Admin Account</h1>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={e => setForm({ ...form, lastName: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            Create Admin
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}