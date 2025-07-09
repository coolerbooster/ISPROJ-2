// pages/reset-password.js

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
    const [error, setError] = useState("");

    useEffect(() => {
        if (queryEmail) setEmail(queryEmail);
    }, [queryEmail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await resetPassword(email, codeValue, newPassword);
            // go back to the index page
            router.push("/");
        } catch (err) {
            setError(err.message || "Failed to reset password.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="login-container">
                <h2>Enter Reset Code</h2>
                <p>Code sent to: <strong>{email}</strong></p>
                <form onSubmit={handleSubmit} className="login-form">
                    <label htmlFor="code">Reset Code:</label>
                    <input
                        id="code"
                        type="text"
                        required
                        value={codeValue}
                        onChange={e => setCodeValue(e.target.value)}
                    />

                    <label htmlFor="new-password">New Password:</label>
                    <input
                        id="new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />

                    <button type="submit">Submit</button>
                    {error && <p className="error">{error}</p>}
                </form>
            </div>

            <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 60px auto;
          padding: 24px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
          margin-bottom: 16px;
          text-align: center;
        }
        .login-form {
          display: flex;
          flex-direction: column;
        }
        label {
          margin: 8px 0 4px;
          font-weight: 500;
        }
        input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          margin-top: 16px;
          padding: 10px;
          background: #0070f3;
          color: #fff;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #005bb5;
        }
        .error {
          margin-top: 12px;
          color: #d00;
          font-size: 0.9em;
        }
      `}</style>
        </>
    );
}
