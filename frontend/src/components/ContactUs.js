import React, { useState, useEffect } from "react";

const ContactUs = () => {
    const [contact, setContact] = useState({
        email: "",
        phone: "",
        address: "",
    });

    // Fetch contact info from the API
    useEffect(() => {
        fetch("http://localhost:5000/api/contact")
            .then((response) => response.json())
            .then((data) => setContact(data))
            .catch((error) => console.error("Error fetching contact:", error));
    }, []);

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Contact Us</h2>
            <div>
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Phone:</strong> {contact.phone}</p>
                <p><strong>Address:</strong> {contact.address}</p>
            </div>
        </div>
    );
};

export default ContactUs;
