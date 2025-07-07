import { useState } from 'react';
import { forgotPassword } from '../services/apiService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await forgotPassword(email);
            setMessage('Reset code sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to send reset code.');
        }
    };

    return (
        <div className="login-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit">Send Reset Code</button>
            </form>
            {message && <p style={{ marginTop: '10px', color: 'green' }}>{message}</p>}
            {error && <p style={{ marginTop: '10px', color: 'red' }}>{error}</p>}
        </div>
    );
}