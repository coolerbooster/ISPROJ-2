import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthController } from '../controllers/AuthController';
import { getUserProfile } from '../services/apiService'; // ✅ Correct path

export default function Navbar() {
    const router = useRouter();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = await getUserProfile(); // ✅ Call API
                setUsername(user.firstName || user.email); // Prefer name, fallback to email
            } catch (err) {
                console.error('Failed to fetch user profile', err);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        AuthController.logout();
        router.replace('/');
    };

    return (
        <nav className="nav-bar">
            <div className="nav-left">
                <div className="logo">JUANEYE</div>
            </div>

            <div className="nav-center">
                <a
                    onClick={() => router.push('/dashboard')}
                    className={`nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                >
                    Dashboard
                </a>
                <a
                    onClick={() => router.push('/user-management')}
                    className={`nav-link ${router.pathname === '/user-management' ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                >
                    User Management
                </a>
                <a
                    onClick={() => router.push('/admin-management')}
                    className={`nav-link ${router.pathname === '/admin-management' ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                >
                    Admin Accounts
                </a>
            </div>

            <div className="nav-right">
                <span className="welcome-text">Welcome, {username || '...'}</span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}