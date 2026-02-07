import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetLink, setResetLink] = useState('');  // State to store the reset link

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password', { username });
            setMessage(response.data.message);  // Message from server, e.g. "Password reset link generated"
            setResetLink(response.data.resetLink);  // Reset link from server
            setError('');  // Clear any previous error messages
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
            setMessage('');  // Clear any previous success messages
            setResetLink('');  // Clear the reset link in case of an error
        }
    };

    return (
        <div className="forgot-password-page">
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
                <label>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            {resetLink && (
                <div>
                    <p>Password reset link:</p>
                    <a href={resetLink} target="_blank" rel="noopener noreferrer">
                        {resetLink}
                    </a>
                    {/* Optionally provide the option to copy the link */}
                    <button onClick={() => navigator.clipboard.writeText(resetLink)}>Copy Link</button>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
