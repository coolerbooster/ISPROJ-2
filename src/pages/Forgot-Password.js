import { useState } from 'react';
import { useRouter } from 'next/router';
import { UserModel } from '../models/UserModel';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = UserModel.findUserByEmail(email);

        if (user) {

            const token = btoa(email); // mock token
            setMessage(`Reset link: http://localhost:3000/reset-password?token=${token}`);
        } else {
            setMessage('Email not found.');
        }
    };

    return (
        <div className="login-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit">Send Reset Link</button>
            </form>
            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </div>
    );
}