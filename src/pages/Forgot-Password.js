// pages/forgot-password.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { forgotPassword } from '../services/apiService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await forgotPassword(email);
            // redirect to the reset-password page, carrying the email in the query
            router.push({
                pathname: '/Reset-Password',
                query: { email },
            });
        } catch (err) {
            setError(err.message || 'Failed to send reset code.');
        }
    };

    return (
        <div className="login-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <button type="submit">Send Reset Code</button>

                {error && (
                    <p style={{ marginTop: '10px', color: 'red' }}>
                        {error}
                    </p>
                )}
            </form>
        </div>
    );
}
