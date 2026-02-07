import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State to track loading
    const navigate = useNavigate(); // Initialize useNavigate to get the navigate function

    // Check if the user is already logged in and redirect to home if so
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            // If user data exists, redirect to Home
            navigate('/');
        }
    }, [navigate]);

    // Handle form submission
    const handleLogin = async (e) => {
        e.preventDefault();

        // Check if username and password are provided
        if (!username || !password) {
            setError('Please fill in both fields');
            return;
        }

        try {
            setIsLoading(true); // Set loading state to true
            setError(''); // Clear previous error messages

            const response = await axios.post('http://localhost:5000/api/login', {
                username,
                password,
            });

            if (response.status === 200) {
                // Extract token and userId from the response
                const { token, userId } = response.data;

                // Log the response to check userId, username, and other data
                console.log('Login successful, user data:', response.data);
                console.log('Username:', username); // Log username
                console.log('User ID:', userId); // Log userId

                // Store the token and userId in localStorage
                localStorage.setItem('token', token); // Store the JWT token
                localStorage.setItem('userId', userId); // Store the userId

                // Determine role (if needed, based on user data or username)
                const isAdmin = (username === 'admin' && password === 'admin');
                const user = {
                    ...response.data, // Store response data (which includes userId)
                    username, // Add username to the user object
                    role: isAdmin ? 'admin' : 'user',
                };

                localStorage.setItem('user', JSON.stringify(user)); // Store user data with role

                // Redirect based on the user's role
                if (isAdmin) {
                    navigate('/admin'); // Redirect to admin panel if admin
                    window.location.reload(); // Refresh the home page after login
                } else {
                    navigate('/'); // Redirect to home page for regular user
                    window.location.reload(); // Refresh the home page after login
                }
            }
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };





    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Login;
