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
            localStorage.setItem('jwt_token', res.token);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                try {
                    await getUserProfile();
                    router.replace('/dashboard');
                } catch {
                    localStorage.removeItem('jwt_token');
                    setCheckingAuth(false);
                }
            } else {
                setCheckingAuth(false);
            }
        };
        checkToken();
    }, []);

    if (checkingAuth) {
        return <div className="text-center py-5">Checking session...</div>;
    }

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="alert alert-danger py-1">{error}</div>}
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">Login</button>
                    </div>
                </form>
                <div className="text-center mt-3">
                    <a href="/Forgot-Password" className="text-decoration-none">Forgot Password?</a>
                </div>
            </div>
        </div>
    );
}