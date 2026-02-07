import React, { useState, useEffect } from "react";
import logoImage from "../images/logo.png"; // Adjust the path to the correct location

const Logo = ({ shoes }) => {
    const [randomShoes, setRandomShoes] = useState([]);
    const [scrollPosition, setScrollPosition] = useState(0);

    // Function to select two random shoes from the list
    const getRandomShoes = () => {
        const shuffledShoes = [...shoes].sort(() => 0.5 - Math.random()); // Shuffle the shoe list
        return shuffledShoes.slice(0, 2); // Get the first two shoes after shuffle
    };

    // Handle scroll event and update the scroll position
    useEffect(() => {
        const handleScroll = () => {
            // Log scroll position for debugging
            console.log("Scroll Position:", window.scrollY);
            // Update scroll position and create parallax effect
            setScrollPosition(window.scrollY);
        };

        // Add event listener to the scroll event
        window.addEventListener("scroll", handleScroll);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setRandomShoes(getRandomShoes()); // Set random shoes on component mount
    }, [shoes]);

    if (!shoes.length) return null;

    // Adjust parallax effect on shoes by slowing down their scroll movement
    const shoePosition = scrollPosition * 0.3; // Adjust the factor for slower/faster parallax

    return (
        <div style={{ position: "relative", textAlign: "center", height: "70vh" }}>
            {/* Large Logo Image */}
            <img
                src={logoImage} // Use the imported logo path
                alt="Logo"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "50%", // Adjust width for the logo size
                    zIndex: 1,
                }}
            />

            {/* Random Shoes on top of the logo with parallax effect */}
            <div
                style={{
                    position: "absolute",
                    top: `calc(40% + ${shoePosition}px)`, // Apply the parallax effect here
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                    display: "flex",
                    justifyContent: "space-around",
                    width: "80%", // Adjust width for shoe container
                }}
            >
                {randomShoes.map((shoe, index) => (
                    <img
                        key={index}
                        src={shoe.image}
                        alt={shoe.name}
                        style={{
                            width: "35%", // Adjusted width for shoe images
                            height: "auto",
                            objectFit: "contain",
                            borderRadius: "10px",
                            transition: "transform 0.2s ease-out", // Smooth transition for parallax effect
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Logo;
