import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/Orders.css";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Error state for handling errors
    const navigate = useNavigate(); // Initialize useNavigate

    // Fetch orders when component mounts
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You need to log in to view your orders.");
            navigate("/login"); // Redirect to login page if there's no token
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch orders.");
                }

                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]); // Add navigate as a dependency

    // Handle removing an order
    const removeOrder = async (orderId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You need to log in to remove orders.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Failed to remove order.");
            }

            // Update the state to remove the order from the UI
            setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
        } catch (error) {
            console.error("Error removing order:", error);
            setError("Failed to remove the order. Please try again.");
        }
    };

    if (loading) {
        return <p>Loading your orders...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (orders.length === 0) {
        return <p>You have no orders yet.</p>;
    }

    return (
        <div className="orders-container">
            <h2>Your Orders</h2>
            <ul className="orders-list">
                {orders.map((order) => (
                    <li key={order.orderId} className="order-item">
                        <img src={order.image} alt={order.name} className="order-image" />
                        <div className="order-details">
                            <h3>{order.name}</h3>
                            <p>Price: ${order.price}</p>
                            <p>Quantity: {order.quantity}</p>
                            <p>Order Date: {new Date(order.date).toLocaleDateString()}</p>
                            <button
                                onClick={() => removeOrder(order.orderId)}
                                className="remove-order-button"
                            >
                                Remove Order
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrdersPage;
