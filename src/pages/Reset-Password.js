import { useState } from 'react';
import { useRouter } from 'next/router';
import { resetPassword } from '../services/apiService';

export default function ResetPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [codeValue, setCodeValue] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await resetPassword(email, codeValue, newPassword);
            setMessage('Password updated successfully! Redirecting to login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        }
    };

    return (
        <div className="login-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Reset Code:</label>
                <input type="text" value={codeValue} onChange={(e) => setCodeValue(e.target.value)} required />

                <label>New Password:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

                <button type="submit">Reset Password</button>
            </form>

            {message && <p style={{ marginTop: '10px', color: 'green' }}>{message}</p>}
            {error && <p style={{ marginTop: '10px', color: 'red' }}>{error}</p>}
        </div>
    );
}