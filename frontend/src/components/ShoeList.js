import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ShoeList.css"; // Import the CSS file

const ShoeList = ({ shoes, onSelectShoe }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true); // Track loading state
    const [animateShoeIds, setAnimateShoeIds] = useState([]); // Track which IDs should animate
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const navigate = useNavigate();
    const ITEMS_PER_PAGE = 9; // Number of shoes per page

    // Filter shoes based on the search query
    const filteredShoes = shoes.filter((shoe) =>
        shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoe.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedShoes = filteredShoes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totalPages = Math.ceil(filteredShoes.length / ITEMS_PER_PAGE);
    // Simulate loading state while filtering (for demo purposes)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
            setAnimateShoeIds(filteredShoes.map((shoe) => shoe.id)); // Trigger animations on first render
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery, shoes]);

    const handleShoeClick = (id) => {
        onSelectShoe(id); // Update the selected shoe
        navigate(`/details/${id}`); // Navigate to the details page with the shoe ID
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <div>
            <div className="parallelogramlist"></div>
            <div
                className="shoeListContainer"
                style={{
                    fontFamily: "Main",
                }}
            >
                <h2 className="title">Available Shoes</h2>
                {/* Search Bar */}
                <div className="searchContainer">
                    <input
                        type="text"
                        placeholder="Search shoes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="searchBar"
                    />
                </div>

                {/* Loading animation */}
                {isLoading ? (
                    <div className="loading-container">
                        <div className="dots-loading">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="shoeGrid">
                            {paginatedShoes.length > 0 ? (
                                paginatedShoes.map((shoe) => (
                                    <div
                                        key={shoe.id}
                                        className={`shoeCard ${animateShoeIds.includes(shoe.id) ? "animate" : ""}`}
                                    >
                                        <img
                                            src={shoe.image}
                                            alt={shoe.name}
                                            className="shoeImage"
                                        />
                                        <div className="shoeDetails">
                                            <h4 className="shoeName">{shoe.name}</h4>
                                            <p className="shoePrice">${shoe.price}</p>
                                            <p className="shoeDescription">{shoe.description}</p>
                                            <button
                                                className="glowButton"
                                                onClick={() => handleShoeClick(shoe.id)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="noResults">No shoes match your search.</p>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="pagination">
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`paginationButton ${currentPage === page ? "active" : ""}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShoeList;
