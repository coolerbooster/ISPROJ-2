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
            router.push({
                pathname: '/Reset-Password',
                query: { email },
            });
        } catch (err) {
            setError(err.message || 'Failed to send reset code.');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    {error && <div className="alert alert-danger py-1">{error}</div>}

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">Send Reset Code</button>
                    </div>
                </form>

                <div className="text-center mt-3">
                    <a href="/" className="text-decoration-none">Back to Login</a>
                </div>
            </div>
        </div>
    );
}