import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.css";

const Profile = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [cart, setCart] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (user && user.username) {
            setUsername(user.username);
        }

        const fetchProfilePic = async () => {
            if (userId && token) {
                try {
                    const response = await axios.get("http://localhost:5000/api/user-profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const picUrl = response.data.profilePicUrl;
                    if (picUrl) {
                        setProfilePic(picUrl);
                    }
                } catch (error) {
                    console.error("Error fetching profile picture:", error);
                }
            }
        };

        const fetchCart = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCart(response.data);
                setError(null);
            } catch (err) {
                setError("Failed to load cart. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfilePic();
        fetchCart();
    }, [userId, token]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    useEffect(() => {
        if (file) {
            const formData = new FormData();
            formData.append("profilePic", file);

            axios
                .post("http://localhost:5000/api/upload-profile-pic", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setMessage(response.data.message);
                    setProfilePic(response.data.profilePicUrl);
                })
                .catch((error) => {
                    setMessage("Error uploading profile picture");
                });
        }
    }, [file]);

    return (
        <div className="profile-page">
            <div className="profile-content">
                {/* Profile Container */}
                <div className="profile-box">
                    {/* Username */}
                    <h2 className="username">{username}</h2>

                    <div className="profile-picture-container">
                        <div
                            className="profile-picture"
                            onClick={() => document.getElementById("file-upload").click()}
                        >
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" />
                            ) : (
                                <p>No profile picture</p>
                            )}
                        </div>
                        {/* Hidden file input */}
                        <input
                            type="file"
                            id="file-upload"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>

                    {/* Forgot Password Link styled as a button */}
                    <div className="forgot-password">
                        <p>
                            <a href="/forgot-password" className="forgot-password-link">
                                Forgot Password?
                            </a>
                        </p>
                    </div>
                </div>

                {/* Cart Container */}
                <div className="cart-box">
                    <h3>Your Cart</h3>
                    {loading && <p className="loading">Loading...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {cart.length === 0 && !loading ? (
                        <p>Your cart is empty. Add some items to your cart!</p>
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
        </div>
    );
};

export default Profile;
