import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ShoeDetails.css";

const ShoeDetails = ({ shoes }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1); // Quantity state
    const [shoe, setShoe] = useState(null);
    const [user, setUser] = useState(null);  // Store the logged-in user
    const [token, setToken] = useState(localStorage.getItem("token")); // JWT token
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        console.log("Token from localStorage:", token); // Log token when component mounts

        // Find the shoe by comparing UUIDs (strings)
        const selectedShoe = shoes.find((shoe) => shoe.id === id); // Compare UUIDs (both are strings)
        if (selectedShoe) {
            setShoe(selectedShoe);
            console.log("Selected shoe:", selectedShoe);
        } else {
            console.log("Shoe not found, redirecting to home.");
            navigate("/"); // Redirect to home if shoe not found
        }

        // Fetch user data if logged in
        if (token) {
            fetch("/api/me", { // Assuming you have a 'me' endpoint that returns the logged-in user info
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    console.log("User data from /api/me:", data); // Log user data
                    setUser(data);
                })
                .catch(error => console.log("Error fetching user data:", error));
        } else {
            console.log("No token found, user is not logged in.");
        }
    }, [id, shoes, navigate, token]);


    const addToCart = () => {
        const token = localStorage.getItem("token");
        console.log("Adding to cart. Token:", token); // Log the token when adding to cart

        if (!token) {
            alert("You need to be logged in to add items to the cart.");
            return;
        }

        fetch("http://localhost:5000/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                shoeId: shoe.id,
                quantity, // Only send necessary fields
            }),
        })
            .then((response) => {
                console.log("Response status:", response.status); // Log the response status

                if (!response.ok) {
                    // If the response is not OK, throw an error
                    return response.json().then((errorData) => {
                        throw new Error(errorData.message || "Failed to add to cart.");
                    });
                }
                return response.json(); // Parse JSON response
            })
            .then((data) => {
                console.log("Response data:", data); // Log the success response
                alert(data.message || "Shoe added to cart!");
            })
            .catch((error) => {
                console.error("Error adding to cart:", error);
                alert(error.message || "Failed to add to cart.");
            });
    };


    // Check if user is logged in, and if not, prevent navigation to the Buy Now page
    const handleBuyNow = () => {
        console.log("Attempting to navigate to Buy Now page."); // Log when trying to navigate to Buy Now

        if (!token) {
            console.log("Token not found, user is not logged in."); // Log token check
            alert("You need to be logged in to buy now.");
            navigate("/login"); // Redirect to login page if not logged in
        } else {
            console.log("Token found, proceeding to Buy Now page."); // Log token found

            // Trigger fade-out animation
            setFadeOut(true);

            // Delay navigation to match fade-out duration
            setTimeout(() => {
                navigate(`/buy-now/${shoe.id}`, { state: { shoe: { ...shoe, quantity } } });
            }, 500); // Adjust the timeout to match the CSS animation duration
        }
    };


    if (!shoe) {
        return <div>Loading...</div>;
    }

    return (
        <div className="shoe-details-page">
            <div className="parallelogramb"></div>

            <div className="shoe-details-container">
                <div className="shoe-image-container">
                    <img
                        src={shoe.image}
                        alt={shoe.name}
                        className="shoe-image"
                    />
                </div>

                <div className="shoe-info">
                    <h2 className="shoe-name1">{shoe.name}</h2>
                    <p className="shoe-description1">{shoe.description}</p>
                    <p className="shoe-price1"><strong>Price:</strong> ${shoe.price}</p>

                    <label className={`quantity ${fadeOut ? "fade-out1" : ""}`}>
                        Quantity:
                        <div className="quantity-input">
                            <button
                                className="quantity-button decrease"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="quantity-field"
                                style={{ transform: 'translateX(-5px)' }}

                            />
                            <button
                                className="quantity-button increase"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                    </label>


                    <div className={`button-group ${fadeOut ? "fade-out1" : ""}`}>
                        <br />
                        <button onClick={handleBuyNow} className="buy-button">
                            Buy Now
                        </button>
                        <br />
                        <button onClick={addToCart} className="add-to-cart-button1">
                            Add to Cart
                        </button>

                        <br />
                        <button onClick={() => navigate("/list")} className="back-button1">
                            Back to Shoe List
                        </button>
                    </div>
                </div>
            </div>
            <div className="parallelogram"></div>
        </div>
    );
};

export default ShoeDetails;
