import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../images/richard-ciraulo-BlI3VVVfP3Y-unsplash.jpg";
import "../styles/style.css";

const Home = ({ shoes, onSelectShoe }) => {
    const [currentShoeIndex, setCurrentShoeIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);
    const navigate = useNavigate();
    const [visibleCards, setVisibleCards] = useState([]);
    const shoeCard1Refs = useRef([]); // Reference array for shoe card DOM elements
    const [scrollPosition, setScrollPosition] = useState(0);
    const imageRef = useRef(null);
    const parallelogramStyle = {
        position: "absolute",
        boxShadow: "0px 20px 50px rgba(0, 0, 0, 0.2)",
        width: "1000px",
        height: "100vh",
        background: "linear-gradient(180deg, rgb(77, 89, 139), rgb(97, 111, 150))",
        transform: "translateX(1300px) skew(20deg)", // Initial transform
        animation: "slide-inhome 1.3s cubic-bezier(0.8, 0, 0.05, 1) forwards",
    };

    const keyframes = `
    @keyframes slide-inhome {
        from {
            transform: translateX(1800px) skew(20deg);
        }
        to {
            transform: translateX(900px) skew(20deg);
        }
    }`;
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY); // Track scrolling
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (imageRef?.current) {
            const translateY = scrollPosition * 0.05; // Scale the rate for slower motion
            imageRef.current.style.transform = `translateY(${translateY}px)`;
        }
    }, [scrollPosition]);

    const handleShoeClick = (id) => {
        onSelectShoe(id); // Update the selected shoe
        navigate(`/details/${id}`); // Navigate to the details page with the shoe ID
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentShoeIndex((prevIndex) => (prevIndex + 1) % shoes.length);
                setFadeIn(true);
            }, 500);
        }, 5000);

        return () => clearInterval(interval);
    }, [shoes.length]);


    useEffect(() => {
        console.log("Setting up IntersectionObserver...");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.dataset.id;
                        if (id && !visibleCards.includes(id)) {
                            console.log("Card is visible:", id);
                            setVisibleCards((prev) => [...prev, id]);
                        }
                    }
                });
            },
            { threshold: 0.2 } // Trigger when 20% of a card is visible
        );

        // Ensure DOM elements are ready after all cards have rendered
        const timeout = setTimeout(() => {
            console.log("Observing cards...");
            shoeCard1Refs.current.forEach((card) => {
                if (card) observer.observe(card);
            });
        }, 100); // Add slight delay to ensure DOM rendering

        return () => {
            console.log("Observer cleanup.");
            clearTimeout(timeout);
            shoeCard1Refs.current.forEach((card) => {
                if (card) observer.unobserve(card);
            });
        };
    }, [shoes, visibleCards]); // Observe only when the list of shoes changes


    if (!shoes.length) {
        return (
            <div className="loading-container" style={{ textAlign: "center", padding: "20px" }}>
                <div className="dots-loading">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
                <p>Loading shoes...</p>
            </div>
        );
    }

    const currentShoe = shoes[currentShoeIndex];

    return (
        <div>

            {/* Upper Section */}
            <div
                style={{
                    position: "relative", // Position relative to stack the background and content
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "20px",
                    paddingTop: "200px", // Adjust the top padding
                    paddingBottom: "100px", // Keep bottom padding if needed
                    paddingLeft: "100px",
                    paddingRight: "100px",

                    height: "750px",
                    flexWrap: "wrap", // Makes it wrap for responsiveness
                    color: "white", // Changes text color to white
                }}
            >
                {/* Background Image Section */}
                <div
                    style={{
                        position: "absolute",

                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(to bottom, #16202c 0%, #1f2d47 100%)",
                        zIndex: -1,

                    }}

                >
                    {/* bottom stripes*/}
                    <style>{keyframes}</style>
                    <div style={parallelogramStyle}></div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "47px",
                            height: "500px",
                            background: "#ECEFF1", // A soft, cool white with a hint of blue-gray
                            boxShadow: "0px 20px 50px rgba(0, 0, 0, 0.2)", // Subtle shadow
                            transition: "transform 0.5s ease",

                            transform: `translate(${scrollPosition * 0.4}px, ${scrollPosition * 0.4}px) rotate(-45deg)translateY(200px)translateX(-30px)`,
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "40px",
                            height: "700px",
                            background: "#ECEFF1",
                            boxShadow: "0px 20px 50px rgba(0, 0, 0, 0.2)", // Subtle shadow
                            transition: "transform 0.3s ease",
                            transform: `translate(${scrollPosition * 0.8}px, ${scrollPosition * 0.8}px) rotate(-45deg)translateY(300px)translateX(-10px)`,
                        }}
                    />


                    {/*top stripes*/}

                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "1400px",
                            height: "40px",
                            background: "#ECEFF1",
                            boxShadow: "0px 20px 50px rgba(0, 0, 0, 0.2)", // Subtle shadow
                            transition: "transform 0.2s ease",

                            transform: `translate(-${scrollPosition * 0.8}px, -${scrollPosition * 0.8}px) rotate(45deg) translateY(-370px) translateX(0px) `,
                        }}

                    />

                </div>
                {/* Image Section */}
                <div

                    className="image"
                    onClick={() => {
                        onSelectShoe(currentShoe.id);
                        navigate(`/details/${currentShoe.id}`);
                    }}

                >
                    <img
                        src={currentShoe.image}
                        alt={currentShoe.name}
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            borderRadius: "8px",
                            filter: "drop-shadow(0px 0px 20px rgba(255, 255, 255, 0.3))",
                            transition: "opacity 0.5s ease, transform 0.7s ease-out", // Smooth transition for both opacity and transform
                            opacity: fadeIn ? 1 : 0,
                            transform: `rotate(-10deg) scale(1.8) translateY(${-90 + scrollPosition * 0.05}px)`, // Fixed and dynamic transforms combined
                        }}
                    />

                </div>

                {/* Text Section */}
                <div
                    style={{
                        flex: "1",
                        fontFamily: "'Poppins', sans-serif",
                        textAlign: "left",
                        padding: "20px",
                        transform: `translateY(-50px) translate(0px, ${-70 + scrollPosition * 0.03}px)`, // Combine fixed and dynamic transforms
                        transition: "transform 0.7s ease-out", // Smooth transition

                    }}
                >
                    <h1
                        style={{
                            fontSize: "4rem",
                            fontWeight: "600",
                            color: "white", // White color for slogan
                            fontFamily: 'Lobster',
                            marginBottom: "15px",
                            textShadow: "0 0 20px rgba(255, 255, 255, 0.2), 0 0 40px rgba(255, 255, 255, 0.15)" // Farther glow with less intensity

                        }}
                    >
                        Shhh... let's not leak<br></br>
                        our hard work
                    </h1>
                    <p
                        style={{
                            fontSize: "1.2rem",
                            color: "white", // White color for the quote
                            marginBottom: "30px",

                        }}
                    >
                        beta devlopment of website                    </p>
                    <button
                        onClick={() => navigate("/list")}
                        className="btn"
                    >
                        Explore Now
                    </button>
                    <div className="btn2"></div>
                </div>
            </div>
            {/* Shoe Cards Section */}
            <div style={{
                padding: "100px", backgroundColor: "#f8f9fa", boxShadow: "0px 12px 30px 10px rgba(0, 0, 0, 0.2)",
            }}>
                <h2
                    style={{

                        textAlign: "left",
                        fontSize: "2rem",
                        marginBottom: "60px",
                        marginLeft: "10px",
                        fontFamily: "'Poppins', sans-serif",
                        color: "#333",
                    }}
                >
                    Featured Shoes
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "20px",
                    }}
                >
                    {shoes.map((shoe, index) => (
                        <div
                            key={shoe.id}
                            ref={(el) => {
                                if (el && !shoeCard1Refs.current.includes(el)) {
                                    shoeCard1Refs.current.push(el);
                                }
                            }}
                            data-id={shoe.id}
                            className={`shoeCard1 ${visibleCards.includes(shoe.id) ? "fadeIn" : "hidden"}`}
                            style={{
                                padding: "20px",
                                backgroundColor: "#fff",
                                borderRadius: "10px",
                                width: "90%",
                                boxShadow: "0px 12px 30px 10px rgba(0, 0, 0, 0.05)",
                                textAlign: "center",
                                cursor: "default", // Change cursor to default
                            }}
                        >
                            <img
                                src={shoe.image}
                                alt={shoe.name}
                                className="shoeImage1"
                                style={{
                                    width: "100%",
                                    maxWidth: "300px",
                                    marginBottom: "10px",
                                    transform: `translate(10px, ${-70 + scrollPosition * 0.07 + (Math.floor(index / 4) === 1 ? -30 : 0)
                                        }px) rotate(-20deg) scale(1.5)`, // Add conditional upward shift for second row
                                    transition: "transform 0.7s ease-out", // Smooth transition
                                    pointerEvents: "none", // Disable pointer events

                                }}
                            />

                            <div
                                className="shoeDetails"
                                style={{
                                    transition: "transform 0.7s ease-out", // Smooth transition
                                }}
                            >
                                <h4
                                    className="shoeName"
                                    style={{ fontSize: "1.2rem", margin: "10px 0" }}
                                >
                                    {shoe.name}
                                </h4>
                                <p className="shoePrice" style={{ color: "#333" }}>
                                    ${shoe.price}
                                </p>
                                <p
                                    className="shoeDescription"
                                    style={{ fontSize: "0.9rem", color: "#666" }}
                                >
                                    {shoe.description}
                                </p>
                                <button
                                    className="glowButton"
                                    onClick={() => handleShoeClick(shoe.id)} // Add onClick to the button
                                    style={{
                                        padding: "10px 20px",
                                        border: "none",
                                        backgroundColor: "#6c757d", // Minimalistic gray
                                        color: "#fff",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </div >
    );
};

export default Home;
