import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { getUserById, updateUser } from '../../services/apiService';
import styles from '../../styles/edit-guardian.module.css';

export default function EditGuardian() {
    const router = useRouter();
    const { id } = router.query;
    const [guardian, setGuardian] = useState(null);
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (id) {
            fetchGuardianDetails(id);
        }
    }, [id]);

    const fetchGuardianDetails = async (guardianId) => {
        try {
            const data = await getUserById(guardianId);
            setGuardian(data);
            setEmail(data.email);
            setAccountType(data.account_type);
        } catch (err) {
            setError('Failed to fetch guardian details.');
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await updateUser(id, { email, account_type: accountType });
            setSuccess('Guardian updated successfully!');
            router.push('/guardian-list');
        } catch (err) {
            setError('Failed to update guardian.');
            console.error(err);
        }
    };

    if (!guardian) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <h1 className={styles.title}>Edit Guardian</h1>
                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="accountType">Account Type</label>
                        <select
                            id="accountType"
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                        >
                            <option value="guardian">Guardian</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <button type="submit" className={styles.submitButton}>Save Changes</button>
                </form>
            </div>
        </>
    );
}