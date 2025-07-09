import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthController } from '../controllers/AuthController';
import { getUserProfile } from '../services/apiService';

export default function Navbar() {
    const router = useRouter();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = await getUserProfile();
                setUsername(user.firstName || user.email);
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
        <div className="navbar-container">
            <div className="navbar-top">
                <div className="navbar-title">JUANEYE</div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <div className="navbar-bottom">
                <div className="nav-links">
                    <span
                        onClick={() => router.push('/dashboard')}
                        className={`nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}
                    >
                        Dashboard
                    </span>
                    <span
                        onClick={() => router.push('/user-management')}
                        className={`nav-link ${router.pathname === '/user-management' ? 'active' : ''}`}
                    >
                        User Management
                    </span>
                    <span
                        onClick={() => router.push('/admin-management')}
                        className={`nav-link ${router.pathname === '/admin-management' ? 'active' : ''}`}
                    >
                        Admin Accounts
                    </span>
                </div>
                <div className="nav-welcome">
                    Welcome, {username || '...'}
                </div>
            </div>
        </div>
    );
}