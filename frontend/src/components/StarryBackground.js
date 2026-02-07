import React, { useEffect, useState } from 'react';
import '../styles/Stars.css'; // Ensure this path is correct

let starId = 0; // A static variable to ensure unique IDs

const StarryBackground = () => {
    const maxStars = 200; // Set maximum number of stars
    const [stars, setStars] = useState([]);

    const createStar = () => {
        const size = Math.random() * 3 + 1; // Star size between 1 and 4
        const left = Math.random() * 100; // Random horizontal position
        const top = Math.random() * 100; // Random vertical position
        return { id: starId++, size, left, top }; // Unique ID for each star
    };

    const generateStars = (count) => {
        setStars((prevStars) => {
            // Generate multiple stars and filter out if we exceed maxStars
            const newStars = Array.from({ length: count }, createStar);
            const combinedStars = [...prevStars, ...newStars];

            // Limit the number of stars to maxStars
            if (combinedStars.length > maxStars) {
                return combinedStars.slice(combinedStars.length - maxStars); // Keep the latest stars
            }
            return combinedStars; // Return all new stars if within limit
        });
    };

    const cleanupStars = () => {
        setStars((prevStars) =>
            prevStars.filter((star) => star.top <= 100) // Keep only stars that are still within the view
        );
    };

    useEffect(() => {
        const generateInterval = setInterval(() => generateStars(10), 200); // Generate 10 stars every 200 ms
        const cleanupInterval = setInterval(cleanupStars, 3000); // Cleanup every 3 seconds

        return () => {
            clearInterval(generateInterval);
            clearInterval(cleanupInterval);
        };
    }, []);

    return (
        <div className="stars">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        width: star.size + 'px',
                        height: star.size + 'px',
                        left: star.left + '%',
                        top: star.top + '%',
                        animation: `moveDiagonal 10s linear infinite, twinkle 1s infinite alternate`,
                    }}
                />
            ))}
        </div>
    );
};

export default StarryBackground;
