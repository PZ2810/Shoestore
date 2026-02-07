// Chatbot.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Chatbot.css";
import { fetchShoes } from "./api";
import { fetchContact } from "./api";
import axios from "axios";

const Chatbot = () => {
    const [messages, setMessages] = useState(() => {
        // Load messages from localStorage if available, otherwise use a default message
        const savedMessages = localStorage.getItem("chatbotMessages");
        return savedMessages ? JSON.parse(savedMessages) : [
            {
                sender: "bot",
                text: "Hello! How can I assist you today?"
            }
        ];
    });
    const [input, setInput] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false); // New state to toggle visibility
    const [isInputFocused, setIsInputFocused] = useState(false);
    const messagesEndRef = useRef(null); // Ref to scroll to the bottom

    const [shoes, setShoes] = useState([]);
    const [contactInfo, setContactInfo] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        // Fetch shoes data from server
        fetchShoes()
            .then((data) => {
                console.log("Fetched Shoes Data:", data);
                setShoes(data);
            })
            .catch((error) => console.error("Error fetching shoes:", error));

        // Fetch contact info at initial load
        fetchContact()
            .then((data) => {
                console.log("Fetched Contact Info:", data);
                setContactInfo(data);
            })
            .catch((error) => console.error("Error fetching contact info:", error));
    }, []);
    useEffect(() => {
        localStorage.setItem("chatbotMessages", JSON.stringify(messages));
    }, [messages]);
    useEffect(() => {
        // Scroll to the bottom smoothly whenever a new message is added
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Triggered when messages change
    const handleSendMessage = async (e) => {
        e.stopPropagation(); // Prevents input from losing focus

        if (input.trim() === "") return;

        const userMessage = { sender: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        setTimeout(async () => {
            const botResponse = await getBotResponse(input);
            console.log("Bot Response:", botResponse);

            setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: botResponse }]);
        }, 1000);

        setInput("");
    };
    const toggleChatWindow = () => {
        setIsChatOpen((prev) => !prev);
    };

    const getBotResponse = async (userInput) => {
        const lowerInput = userInput.toLowerCase();

        // Handle Trending Shoe Request
        if (lowerInput.includes("trending") || lowerInput.includes("view trending")) {
            if (shoes.length > 0) {
                const randomShoe = shoes[Math.floor(Math.random() * shoes.length)];
                return `Today's trending shoe is:\nName: ${randomShoe.name}\nPrice: $${randomShoe.price}\nDescription: ${randomShoe.description}`;
            }
            return "Sorry, no shoes are currently available to display as trending.";
        }

        // Handle Contact Us Command
        if (lowerInput.includes("contact")) {
            if (contactInfo) {
                return `Here are our contact details:\nPhone: ${contactInfo.phone}\nEmail: ${contactInfo.email}\nAddress: ${contactInfo.address}`;
            }
            return "Fetching contact details, please wait...";
        }
        if (lowerInput.includes("add") && lowerInput.includes("to cart")) {
            const shoeNameMatch = lowerInput.match(/add (.*) to cart/);
            if (shoeNameMatch && shoeNameMatch[1]) {
                const query = shoeNameMatch[1].trim().toLowerCase();
                const matchedShoes = shoes.filter((shoe) =>
                    shoe.name.toLowerCase().includes(query)
                );

                if (matchedShoes.length === 0) {
                    return "I couldn't find that shoe. Please try again.";
                }

                if (matchedShoes.length > 1) {
                    const shoeNames = matchedShoes.map((shoe) => shoe.name).join(", ");
                    const userChoice = window.prompt(
                        `Multiple shoes found: ${shoeNames}. Please type the full name of the one you'd like to add to your cart.`
                    );

                    const selectedShoe = matchedShoes.find(
                        (shoe) => shoe.name.toLowerCase() === userChoice.toLowerCase()
                    );

                    if (selectedShoe) {
                        try {
                            const token = localStorage.getItem("token");
                            await axios.post(
                                "http://localhost:5000/api/cart",
                                {
                                    shoeId: selectedShoe.id,
                                    quantity: 1,
                                },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            return `${selectedShoe.name} has been successfully added to your cart at $${selectedShoe.price}.`;
                        } catch (error) {
                            console.error(error);
                            return "Could not add the item to your cart. Please try again.";
                        }
                    }
                    return "Could not identify the selected shoe. Please try again.";
                }

                const selectedShoe = matchedShoes[0];
                try {
                    const token = localStorage.getItem("token");
                    await axios.post(
                        "http://localhost:5000/api/cart",
                        {
                            shoeId: selectedShoe.id,
                            quantity: 1,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    return `${selectedShoe.name} has been successfully added to your cart at $${selectedShoe.price}.`;
                } catch (error) {
                    console.error(error);
                    return "Could not add the item to your cart. Please try again.";
                }
            }
        }

        // Handle Update Quantity
        if (lowerInput.includes("update quantity")) {
            const quantityMatch = lowerInput.match(/update quantity of (.*) to (\d+)/);
            if (quantityMatch && quantityMatch[1] && quantityMatch[2]) {
                const shoeName = quantityMatch[1].trim();
                const quantity = parseInt(quantityMatch[2]);
                const shoeToUpdate = shoes.find((shoe) =>
                    shoe.name.toLowerCase() === shoeName
                );

                if (shoeToUpdate) {
                    try {
                        const token = localStorage.getItem("token");
                        await axios.put(
                            "http://localhost:5000/api/cart/update",
                            {
                                shoeId: shoeToUpdate.id,
                                quantity,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        return `Updated the quantity of ${shoeToUpdate.name} to ${quantity}.`;
                    } catch (error) {
                        console.error(error);
                        return "Could not update the quantity. Please try again.";
                    }
                }

                return "I couldn't find that shoe to update. Please try again.";
            }
        }

        // Handle Remove Specific Item
        if (lowerInput.includes("remove")) {
            const shoeNameMatch = lowerInput.match(/remove (.*)/);
            if (shoeNameMatch && shoeNameMatch[1]) {
                const query = shoeNameMatch[1].trim().toLowerCase();
                const matchedShoes = shoes.filter((shoe) =>
                    shoe.name.toLowerCase().includes(query)
                );

                if (matchedShoes.length === 0) {
                    return "I couldn't find that shoe to remove. Please try again.";
                }

                if (matchedShoes.length > 1) {
                    const shoeNames = matchedShoes.map((shoe) => shoe.name).join(", ");
                    const userChoice = window.prompt(
                        `Multiple shoes found: ${shoeNames}. Please type the full name of the one you'd like to remove from your cart.`
                    );

                    const selectedShoe = matchedShoes.find(
                        (shoe) => shoe.name.toLowerCase() === userChoice.toLowerCase()
                    );

                    if (selectedShoe) {
                        try {
                            const token = localStorage.getItem("token");
                            await axios.delete(
                                `http://localhost:5000/api/cart/${selectedShoe.id}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            return `${selectedShoe.name} has been removed from your cart.`;
                        } catch (error) {
                            console.error(error);
                            return "Could not remove the item. Please try again.";
                        }
                    }
                    return "Could not identify the selected shoe. Please try again.";
                }

                const selectedShoe = matchedShoes[0];
                try {
                    const token = localStorage.getItem("token");
                    await axios.delete(
                        `http://localhost:5000/api/cart/${selectedShoe.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    return `${selectedShoe.name} has been removed from your cart.`;
                } catch (error) {
                    console.error(error);
                    return "Could not remove the item. Please try again.";
                }
            }
        }
        if (lowerInput.includes("home")) {
            navigate("/");
            return "Redirecting you to the Home page...";
        }

        // Handle navigation commands like cart
        if (lowerInput.includes("cart")) {
            navigate("/cart");
            return "Redirecting you to the Cart page...";
        }

        if (lowerInput.includes("orders")) {
            navigate("/orders");
            return "Redirecting you to your Orders page...";
        }

        if (lowerInput.includes("login")) {
            navigate("/login");
            return "Redirecting you to the Login page...";
        }

        if (lowerInput.includes("signup")) {
            navigate("/signup");
            return "Redirecting you to the Signup page...";
        }

        if (lowerInput.includes("signout")) {
            navigate("/signout");
            return "Logging you out. Please wait...";
        }

        // Handle searching for specific shoes
        const matchingShoes = shoes.filter(
            (shoe) =>
                shoe.name.toLowerCase().includes(lowerInput) ||
                shoe.price.toString().includes(lowerInput)
        );

        if (matchingShoes.length > 0) {
            if (matchingShoes.length === 1) {
                navigate(`/details/${matchingShoes[0].id}`);
                return `Navigating to ${matchingShoes[0].name}'s details page.`;
            }

            return matchingShoes
                .map(
                    (shoe) =>
                        `Name: ${shoe.name}, Price: $${shoe.price}, Description: ${shoe.description}`
                )
                .join("\n\n");
        }

        if (lowerInput.includes("buy")) {
            return "You can purchase shoes directly on the Buy Now page.";
        }

        if (lowerInput.includes("shoe")) {
            return "We have a variety of shoes available. Try searching by name or price.";
        }

        return "I'm here to help! You can ask me about shoes, contact info, login, orders, or your cart.";
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header" >Chat with Us</div>
            <div className={`chatbot-messages ${isInputFocused ? "open" : ""}`}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chatbot-message ${message.sender}`}
                    >
                        {message.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />

            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    onFocus={() => setIsInputFocused(true)} // When user clicks or focuses
                    onBlur={(e) => {
                        // Only blur if it's not clicking the Send button
                        setTimeout(() => {
                            if (!e.relatedTarget?.classList.contains("send-button")) {
                                setIsInputFocused(false);
                            }
                        }, 0);
                    }}
                />
                <button
                    className="send-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSendMessage(e);
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
