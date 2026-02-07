import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Cart.css";

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("You need to be logged in to access your cart.");
                navigate("/login");
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Update state with the cart items or handle empty array
                setCart(response.data); // Will be [] if the cart is empty
                setError(null);
            } catch (err) {
                console.error("Failed to fetch cart:", err);
                setError("Failed to load cart. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, [navigate]);



    // Update quantity of a cart item
    const updateQuantity = async (shoeId, newQuantity) => {
        if (newQuantity < 1) {
            setError("Quantity must be at least 1.");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/api/cart/${shoeId}`,
                { quantity: newQuantity },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Update the quantity in the local state
            setCart((prevCart) =>
                prevCart.map((item) =>
                    item.shoe_id === shoeId ? { ...item, quantity: newQuantity } : item
                )
            );
            setError(null); // Clear any previous error
        } catch (err) {
            console.error("Failed to update quantity:", err);
            setError("Failed to update quantity. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Remove an item from the cart
    const removeFromCart = async (shoeId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/cart/${shoeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove the item from the local state
            setCart((prevCart) => prevCart.filter((item) => item.shoe_id !== shoeId));
            setError(null);
        } catch (err) {
            console.error("Failed to remove item:", err);
            setError("Failed to remove item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate the total price of the cart
    const calculateTotal = () => {
        return cart
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2);
    };

    // Place an individual order for an item (Buy Now)
    const handleBuyNow = async (shoe) => {
        if (!shoe.isAvailable) {
            setError("This item is out of stock and cannot be purchased.");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                alert("You need to be logged in to place an order.");
                return;
            }

            const quantity = shoe.quantity;

            // Make a POST request to place the individual order from the cart
            const response = await axios.post(
                "http://localhost:5000/api/orders/cart",  // Use the new endpoint for cart-specific Buy Now
                {
                    shoeId: shoe.shoe_id,  // Use shoe_id instead of id
                    name: shoe.name,
                    price: shoe.price,
                    image: shoe.image,
                    quantity,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201) {
                alert("Order placed successfully!");
                // Remove the item from the cart after successful purchase
                setCart((prevCart) => prevCart.filter((item) => item.shoe_id !== shoe.shoe_id));
            } else {
                throw new Error("Failed to place order.");
            }
        } catch (err) {
            console.error("Failed to place order:", err);
            setError("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Proceed to checkout: Move all cart items to orders
    const proceedToCheckout = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const orders = cart
                .filter(item => item.isAvailable)  // Only include available items
                .map((item) => ({
                    shoeId: item.shoe_id,  // Correct field name
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity,
                }));

            if (orders.length === 0) {
                setError("No available items in the cart to checkout.");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/orders/bulk",
                { orders },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201) {
                alert("Checkout successful! Your orders have been placed.");
                setCart([]); // Clear the cart after successful checkout
                navigate("/orders"); // Redirect to orders page
            } else {
                throw new Error("Failed to checkout.");
            }
        } catch (err) {
            console.error("Failed to proceed to checkout:", err);
            setError("Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cart-page">
            <h2>Your Cart</h2>

            {error && <p className="error-message">{error}</p>}
            {loading && <p>Loading...</p>}

            {cart.length === 0 && !loading ? (
                <p>Your cart is empty. Add some shoes to your cart!</p>
            ) : (
                <div className="cart-items-container">
                    <div className="cart-items">
                        {cart.map((shoe) => (
                            <div key={shoe.shoe_id} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={shoe.image} alt={shoe.name} />
                                </div>
                                <div className="cart-item-info">
                                    <h3>{shoe.name}</h3>
                                    <p>Price: ${shoe.price}</p>
                                    <p>
                                        Quantity:
                                        <input
                                            type="number"
                                            value={shoe.quantity}
                                            min="1"
                                            onChange={(e) =>
                                                updateQuantity(
                                                    shoe.shoe_id,
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                        />
                                    </p>
                                    <p>Total: ${(shoe.quantity * shoe.price).toFixed(2)}</p>
                                    <p className={shoe.isAvailable ? "available" : "out-of-stock"}>
                                        {shoe.isAvailable ? "Available" : "Out of Stock"}
                                    </p>
                                </div>
                                <div className="cart-item-actions">
                                    <button
                                        onClick={() => handleBuyNow(shoe)}
                                        className="buy-now-button"
                                        disabled={loading || !shoe.isAvailable}
                                    >
                                        Buy Now
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(shoe.shoe_id)}
                                        className="remove-button"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {cart.length > 0 && (
                <div className="cart-summary">
                    <p>
                        <strong>Total: ${calculateTotal()}</strong>
                    </p>
                    <button
                        onClick={proceedToCheckout}
                        className="checkout-button"
                        disabled={loading}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </div>

    );
};

export default Cart;
