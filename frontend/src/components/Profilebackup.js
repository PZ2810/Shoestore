import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.css";

const Profile = () => {
    const [cart, setCart] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state
    const [username, setUsername] = useState("");

    useEffect(() => {
        // Fetch the username from local storage
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.username) {
            setUsername(user.username);
        }

        // Fetch the cart data
        const fetchCart = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/api/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCart(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch cart:", err);
                setError("Failed to load cart. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    return (
        <div className="profile-page">
            <h2>Welcome, {username}!</h2>

            {error && <p className="error-message">{error}</p>}
            {loading && <p>Loading...</p>}
            <div className="forgot-password">
                <p>
                    <a href="/forgot-password">Forgot Password?</a>
                </p>
            </div>

            <div className="profile-cart">
                <h3>Your Cart</h3>
                {cart.length === 0 && !loading ? (
                    <p>Your cart is empty. Add some shoes to your cart!</p>
                ) : (
                    <div className="cart-items">
                        {cart.map((shoe) => (
                            <div key={shoe.id} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={shoe.image} alt={shoe.name} />
                                </div>
                                <div className="cart-item-info">
                                    <h3>{shoe.name}</h3>
                                    <p>Price: ${shoe.price}</p>
                                    <p>Quantity: {shoe.quantity}</p>
                                    <p>Total: ${(shoe.quantity * shoe.price).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
