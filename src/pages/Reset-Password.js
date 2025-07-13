import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { resetPassword } from "../services/apiService";

export default function ResetPasswordPage() {
    const router = useRouter();
    const { email: queryEmail } = router.query;

    const [email, setEmail] = useState(queryEmail || "");
    const [codeValue, setCodeValue] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (queryEmail) setEmail(queryEmail);
    }, [queryEmail]);

    const validatePassword = () => {
        if (!newPassword || !confirmPassword) {
            setError("All fields are required.");
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return false;
        }

        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasLetter || !hasNumberOrSymbol) {
            setError("Password must include at least one letter and one number or special character.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validatePassword()) return;

        try {
            await resetPassword(email, codeValue, newPassword);
            router.push("/");
        } catch (err) {
            setError(err.message || "Failed to reset password.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
                    <h2 className="text-center mb-3">Reset Password</h2>
                    <p className="text-center text-muted mb-4">
                        Code sent to: <strong>{email}</strong>
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="code" className="form-label">Reset Code</label>
                            <input
                                id="code"
                                type="text"
                                className="form-control"
                                required
                                value={codeValue}
                                onChange={e => setCodeValue(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="new-password" className="form-label">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                className="form-control"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                className="form-control"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {error && <div className="alert alert-danger py-2">{error}</div>}

                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </div>
                    </form>

                    <div className="text-center mt-3">
                        <a href="/" className="text-decoration-none">Back to Login</a>
                    </div>
                </div>
            </div>
        </>
    );
}