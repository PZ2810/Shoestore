import React, { useState } from 'react';
import '../styles/CartButton.css'; // Make sure the CSS is imported

const CartButton = () => {
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);

        // Reset the animation state after it finishes
        setTimeout(() => {
            setClicked(false);
        }, 1500); // Match this with the animation duration (1.5s)
    };

    return (
        <button
            className={`cart-button ${clicked ? 'clicked' : ''}`}
            onClick={handleClick}
        >
            <i className="fa fa-shopping-cart"></i>
            <i className="fa fa-box"></i>
        </button>
    );
};

export default CartButton;
