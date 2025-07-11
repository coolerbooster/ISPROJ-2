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
        <div className="navbar-wrapper">
            {/* Top half - blue background */}
            <div className="navbar-top bg-primary text-white px-4 py-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div className="navbar-title fw-bold fs-4">JUANEYE</div>
                <button className="btn btn-outline-light btn-sm mt-2 mt-md-0" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Bottom half - white background */}
            <div className="navbar-bottom bg-white px-4 py-2 d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div className="nav-links d-flex gap-4 flex-wrap">
                    <span
                        onClick={() => router.push('/dashboard')}
                        className={`nav-link fs-6 ${router.pathname === '/dashboard' ? 'fw-bold text-primary' : 'text-dark'}`}
                        style={{ cursor: 'pointer' }}
                    >
                        Dashboard
                    </span>
                    <span
                        onClick={() => router.push('/user-management')}
                        className={`nav-link fs-6 ${router.pathname === '/user-management' ? 'fw-bold text-primary' : 'text-dark'}`}
                        style={{ cursor: 'pointer' }}
                    >
                        User Management
                    </span>
                    <span
                        onClick={() => router.push('/admin-management')}
                        className={`nav-link fs-6 ${router.pathname === '/admin-management' ? 'fw-bold text-primary' : 'text-dark'}`}
                        style={{ cursor: 'pointer' }}
                    >
                        Admin Accounts
                    </span>
                </div>
                <div className="nav-welcome mt-2 mt-md-0 text-dark fs-6">
                    Welcome, {username || '...'}
                </div>
            </div>
        </div>
    );
}