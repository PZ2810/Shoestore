import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <div className="navbar">
            <div className="navbar-logo">
                <h1>Shoe Store</h1>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/list">Shoe List</Link> {/* Added Shoe List link */}
                <Link to="/admin">Admin Panel</Link>
                <Link to="/contact">Contact Us</Link>
            </div>
        </div>
    );
};

export default Navbar;
