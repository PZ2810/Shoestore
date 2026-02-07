import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../components/useAuth';
import './Hamburger.css';
import axios from 'axios';


const Hamburger = ({ shoes }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredShoes, setFilteredShoes] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const navigate = useNavigate();
    const isAuthenticated = useAuth();
    const menuRef = useRef(null); // Ref for the menu container
    const dropdownRef = useRef(null); // Ref for dropdown

    const [isScrolled, setIsScrolled] = useState(false); // State for scroll behavior
    const location = useLocation(); // Get current location/route information


    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user?.username) setUsername(user.username);
                if (user?.profilePicUrl) setProfilePic(user.profilePicUrl);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
            }
        }

        const fetchProfilePic = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get("http://localhost:5000/api/user-profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.data.profilePicUrl) {
                        setProfilePic(response.data.profilePicUrl);
                    }
                } catch (error) {
                    console.error('Error fetching profile picture:', error);
                }
            }
        };

        fetchProfilePic();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !event.target.classList.contains('search-bar')
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);
    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            const results = shoes.filter((shoe) =>
                shoe.name.toLowerCase().includes(query.toLowerCase()) ||
                shoe.description.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredShoes(results);
            setIsDropdownOpen(true);
        } else {
            setFilteredShoes([]);
            setIsDropdownOpen(false);
        }
    };

    const handleSelectShoe = (id) => {
        navigate(`/details/${id}`);
        setSearchQuery('');
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem("chatbotMessages"); // Clear chatbot messages

        navigate('/login');
        setMenuOpen(false);
        setTimeout(() => {
            window.location.reload(); // Reload the window after navigation
        }, 100);
    };

    const isAdmin = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.role === 'admin';
    };
    const handleScrollEffect = () => {
        if (window.scrollY > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    useEffect(() => {
        if (location.pathname === '/') {
            const handleScroll = () => {
                setIsScrolled(window.scrollY > 250);
            };

            // Force transparency if at the top of the page
            if (window.scrollY === 0) {
                setIsScrolled(false);
            }

            window.addEventListener('scroll', handleScroll);

            // Cleanup listener when leaving the home page
            return () => window.removeEventListener('scroll', handleScroll);
        } else {
            // Reset scroll state when leaving the home page
            setIsScrolled(true);
        }
    }, [location.pathname]);
    const closeMenu = () => setMenuOpen(false);
    return (
        <div>
            <div>
                <div
                    className="hamburger-container"

                    style={{
                        background: location.pathname === '/'
                            ? isScrolled
                                ? 'rgba(28, 40, 62, 0.5)'  // Slightly adjusted grey
                                : 'transparent'
                            : location.pathname.startsWith('/details/') || location.pathname.startsWith('/buy-now/')
                                ? 'transparent' // Completely transparent for /details/:id and /buy-now/:id
                                : 'rgba(28, 40, 62, 0.5)', // Default for non-home pages

                        backdropFilter: location.pathname === '/'
                            ? isScrolled
                                ? 'blur(20px)'
                                : 'none'
                            : location.pathname.startsWith('/details/') || location.pathname.startsWith('/buy-now/')
                                ? 'none' // No blur for /details/:id and /buy-now/:id
                                : 'blur(20px)', // Always apply blur effect on non-home pages

                        boxShadow: location.pathname === '/'
                            ? isScrolled
                                ? '0 4px 20px rgba(0, 0, 0, 0.2)' // Only appear when scrolled for the home page
                                : 'none'
                            : location.pathname.startsWith('/details/') || location.pathname.startsWith('/buy-now/')
                                ? 'none' // No shadow for /details/:id and /buy-now/:id
                                : '0 4px 20px rgba(0, 0, 0, 0.2)', // Always appear for other non-home pages
                    }}


                >
                    {/* Logo */}
                    <div
                        className="logo"
                        onClick={() => navigate("/")}
                        style={{ cursor: "pointer" }} // Optional to indicate it's clickable
                    >
                        <h1>ShoeStore</h1>
                    </div>

                    {/* Search Bar */}


                    {/* Hamburger Menu */}

                </div>
            </div>
            <div className="hamburger-menu" ref={menuRef}>
                <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                    <span className="line"></span>
                    <span className="line"></span>
                    <span className="line"></span>
                </div>
                <div className={`menu-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={closeMenu}>Home</Link>
                    <Link to="/list" onClick={closeMenu}>Shop</Link>
                    {isAdmin() && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
                    <Link to="/contact" onClick={closeMenu}>Contact</Link>
                    <Link to="/cart" onClick={closeMenu}>Cart</Link>
                    <Link to="/orders" onClick={closeMenu}>Orders</Link>
                    {isAuthenticated ? (
                        <div className="auth-section">
                            <Link
                                to="/profile"
                                className="username-link"
                                onClick={closeMenu}
                            >
                                {profilePic ? (
                                    <div className="username-container">
                                        <img
                                            src={profilePic}
                                            alt="Profile"
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                marginRight: '10px',
                                            }}
                                        />
                                        <span>{username}</span>
                                    </div>
                                ) : (
                                    <span>Welcome, {username}!</span>
                                )}
                            </Link>
                            <button onClick={handleLogout} className="auth-button logout-button">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="auth-button login-button"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                onClick={closeMenu}
                                className="auth-button signup-button"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

            </div>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search for shoes"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-bar"
                />
                {isDropdownOpen && filteredShoes.length > 0 && (
                    <div
                        className="dropdown"
                        ref={dropdownRef}
                    >
                        <ul>
                            {filteredShoes.map((shoe) => (
                                <li
                                    key={shoe.id}
                                    onClick={() => handleSelectShoe(shoe.id)}
                                    className="dropdown-item"
                                >
                                    <img src={shoe.image} alt={shoe.name} className="dropdown-image" />
                                    <span>{shoe.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hamburger;
