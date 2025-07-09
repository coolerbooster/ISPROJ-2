import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login, getUserProfile } from '../services/apiService';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login(email, password);
            localStorage.setItem('jwt_token', res.token); // 👈 changed
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('jwt_token'); // 👈 changed
            if (token) {
                try {
                    await getUserProfile();
                    router.replace('/dashboard');
                } catch {
                    localStorage.removeItem('jwt_token'); // 👈 changed
                    setCheckingAuth(false);
                }
            } else {
                setCheckingAuth(false);
            }
        };
        checkToken();
    }, []);

    if (checkingAuth) {
        return <div style={{ textAlign: 'center' }}>Checking session...</div>;
    }

    return (
        <div className="login-container">
            <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Admin Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
                <a href="/Forgot-Password">Forgot Password?</a>
            </p>
        </div>
    );
}
