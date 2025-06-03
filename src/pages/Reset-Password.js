import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserModel } from '../models/UserModel';

export default function ResetPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (router.query.token) {
            const decodedEmail = atob(router.query.token);
            setEmail(decodedEmail);
        }
    }, [router.query.token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = UserModel.resetPassword(email, newPassword);
        setMessage(success ? 'Password updated successfully!' : 'Error updating password.');
    };

    return (
        <div className="login-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <label>New Password:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </div>
    );
}