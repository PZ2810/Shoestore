import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically sign out when the component is loaded
        localStorage.removeItem('user'); // Clear user data from localStorage
        localStorage.removeItem('token'); // Clear token from localStorage
        localStorage.removeItem("chatbotMessages"); // Clear chatbot messages

        navigate('/login'); // Redirect to login page
    }, [navigate]);

    return null; // No need to render anything
};

export default Signout;
