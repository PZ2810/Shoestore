import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/BuyNowPage.css"; // Import the CSS file for styling

const BuyNowPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Access the location object
    const { shoe } = location.state || {}; // Retrieve shoe data from state

    // If no shoe is passed, display an error message and provide an option to go back
    if (!shoe) {
        return (
            <div className="no-shoe-container">
                <p>No shoe selected. Go back to the shop.</p>
                <button onClick={() => navigate("/")} className="back-button">
                    Back to Shop
                </button>
            </div>
        );
    }

    const proceedToPayment = async () => {
        console.log("Attempting to place an order...");
        console.log("Shoe details:", shoe);
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        if (!token) {
            alert("You need to be logged in to proceed.");
            return;
        }
        const quantity = shoe.quantity;

        try {
            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    shoeId: shoe.id,
                    name: shoe.name,
                    price: shoe.price,
                    image: shoe.image,
                    quantity,
                }),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (response.ok) {
                const data = await response.json();
                console.log("Order placed successfully:", data);
                alert("Order placed successfully!");
                navigate("/orders"); // Redirect to orders page

            } else {
                const errorData = await response.json();
                console.error("Error placing order:", errorData);
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Error during order placement:", error);
            alert("An unexpected error occurred. Please try again later.");
        }
    };



    return (
        <div className="buy-now-container">
            <div className="shoe-details-container">
                <div className="shoe-image-container">
                    <img
                        src={shoe.image}
                        alt={shoe.name}
                        className="shoe-image1"
                    />
                </div>
                <div className="shoe-info1">
                    <h2 className="shoe-name1">{shoe.name}</h2>
                    <p className="shoe-description1">{shoe.description}</p>
                    <p className="shoe-price1"><strong>Price:</strong> ${shoe.price}</p>



                    <div className="button-group1">
                        <br></br>
                        <button onClick={proceedToPayment} className="buy-button">
                            Proceed to Payment
                        </button>
                        <br></br>
                        <button onClick={() => navigate(`/details/${shoe.id}`)} className="back-button1">
                            Back to Shop
                        </button>
                    </div>
                </div>
            </div>
            <div className="parallelogram1"></div>

        </div>
    );
};

export default BuyNowPage;
