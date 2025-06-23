import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthController } from '../controllers/AuthController';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = AuthController.login(username, password);

        if (isValid) {
            router.push('/dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (AuthController.isAuthenticated()) {
            router.replace('/dashboard');
        }

        const handlePopState = () => {
            if (!AuthController.isAuthenticated()) {
                router.replace('/');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return (
        <div className="login-container">
            <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Admin Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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