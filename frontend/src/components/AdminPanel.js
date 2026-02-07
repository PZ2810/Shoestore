import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";  // Import Navigate here
import {
    handleInputChange,
    handleFileChange,
    handleAddShoe,
    handleEditShoe,
    handleUpdateShoe,
    handleContactChange,
    handleUpdateContact
} from "./AdminFunctions"; // Import functions from AdminFunctions.js
import "../styles/AdminPanel.css"; // Import the CSS file

const AdminPanel = ({
    shoes,
    setShoes,
    deleteShoe,
    contact,
    updateContact,
}) => {
    const [form, setForm] = useState({
        name: "",
        price: "",
        description: "",
        image: "", // URL for image or local image file
    });

    const [contactForm, setContactForm] = useState(contact);
    const [editingShoeId, setEditingShoeId] = useState(null); // Track the shoe being edited
    const [loadingContact, setLoadingContact] = useState(!contact.email); // Check if contact details are loading
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [localImage, setLocalImage] = useState(null); // Track local image file

    const shoeListRef = useRef(null); // Reference to the shoe list container
    const user = JSON.parse(localStorage.getItem('user'));

    // Move user check below hooks, after they are all called
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            return <Navigate to="/" />;
        }
    }, [user]);

    // Save Global Scroll Position
    useEffect(() => {
        // Save global scroll position whenever the page is scrolled
        const handleGlobalScroll = () => {
            localStorage.setItem('globalScrollPosition', window.scrollY);
        };

        // Attach global scroll listener
        window.addEventListener('scroll', handleGlobalScroll);

        // Restore global scroll position on page load
        const savedGlobalScrollPosition = localStorage.getItem('globalScrollPosition');
        if (savedGlobalScrollPosition) {
            window.scrollTo(0, parseInt(savedGlobalScrollPosition, 10));
        }

        // Clean up scroll listener
        return () => {
            window.removeEventListener('scroll', handleGlobalScroll);
        };
    }, []);

    useEffect(() => {
        if (contact.email) {
            setLoadingContact(false); // Set loading to false once contact data is available
        }
    }, [contact]);

    useEffect(() => {
        // Retrieve search query from localStorage on component mount
        const savedSearchQuery = localStorage.getItem('searchQuery');
        if (savedSearchQuery) {
            setSearchQuery(savedSearchQuery);
        }

        // Restore scroll position for shoe list after component mounts
        const savedScrollPosition = localStorage.getItem('shoeListScrollPosition');
        if (savedScrollPosition && shoeListRef.current) {
            setTimeout(() => {
                shoeListRef.current.scrollTop = parseInt(savedScrollPosition, 10);
            }, 100); // Delay to ensure layout is fully rendered
        }
    }, []);

    // Save search query to localStorage on change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        localStorage.setItem('searchQuery', value); // Save search query to localStorage
    };

    // Filter shoes based on search query
    const filteredShoes = shoes.filter(shoe =>
        shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoe.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Save scroll position for shoe list when scrolling
    const handleShoeListScroll = () => {
        if (shoeListRef.current) {
            localStorage.setItem('shoeListScrollPosition', shoeListRef.current.scrollTop); // Save scroll position of shoe list
        }
    };

    useEffect(() => {
        // Attach scroll event listener to the shoe list to save scroll position
        if (shoeListRef.current) {
            shoeListRef.current.addEventListener('scroll', handleShoeListScroll);
        }

        // Clean up event listener on unmount
        return () => {
            if (shoeListRef.current) {
                shoeListRef.current.removeEventListener('scroll', handleShoeListScroll);
            }
        };
    }, []);

    const handleFileChangeWithCancel = (e) => {
        handleFileChange(e, form, setForm);
        setLocalImage(e.target.files[0]); // Store the local file when it's uploaded
    };

    const cancelLocalImage = () => {
        setLocalImage(null); // Remove local image
        setForm((prevState) => ({ ...prevState, image: "" })); // Clear the image field
    };

    // Early return for user authentication check
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="adminPanel">
            <div className="adminLeft">
                {/* Add or Edit Shoe Form */}
                <div className="formContainer">
                    <form
                        onSubmit={editingShoeId ? (e) => handleUpdateShoe(e, form, editingShoeId, setShoes, setForm, setEditingShoeId) : (e) => handleAddShoe(e, form, setShoes, setForm)}
                        className="form"
                    >
                        <input
                            type="text"
                            name="name"
                            placeholder="Shoe Name"
                            value={form.name}
                            onChange={(e) => handleInputChange(e, form, setForm)}
                            className="input"
                        />
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={form.price}
                            onChange={(e) => handleInputChange(e, form, setForm)}
                            className="input"
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => handleInputChange(e, form, setForm)}
                            className="textarea"
                        />

                        {/* Conditionally render the image URL input or local image input */}
                        {!localImage ? (
                            <>
                                <input
                                    type="text"
                                    name="image"
                                    placeholder="Image URL"
                                    value={form.image}
                                    onChange={(e) => handleInputChange(e, form, setForm)}
                                    className="input"
                                />
                            </>
                        ) : (
                            <div className="localImagePreview">
                                <img
                                    src={URL.createObjectURL(localImage)}
                                    alt="Local preview"
                                    className="shoeImage"
                                />
                                <button type="button" onClick={cancelLocalImage} className="cancelImageButton">X</button>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChangeWithCancel}
                            className="fileInput"
                        />

                        <button type="submit" className="button">
                            {editingShoeId ? "Update Shoe" : "Add Shoe"}
                        </button>
                    </form>
                </div>

                {/* Contact Details Form */}
                <div className="formContainer">
                    <h3 className="subHeader">Contact Details</h3>
                    {loadingContact ? (
                        <div>Loading contact details...</div>
                    ) : (
                        <form onSubmit={(e) => handleUpdateContact(e, contactForm, updateContact)} className="form">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={contactForm.email}
                                onChange={(e) => handleContactChange(e, contactForm, setContactForm)}
                                className="input"
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={contactForm.phone}
                                onChange={(e) => handleContactChange(e, contactForm, setContactForm)}
                                className="input"
                            />
                            <textarea
                                name="address"
                                placeholder="Address"
                                value={contactForm.address}
                                onChange={(e) => handleContactChange(e, contactForm, setContactForm)}
                                className="textarea"
                            />
                            <button type="submit" className="button">
                                Update Contact
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Shoe Inventory */}
            <div className="shoeList" ref={shoeListRef}>
                <h3 className="subHeader">Current Inventory</h3>

                {/* Search Input */}
                <div className="searchContainer">
                    <input
                        type="text"
                        placeholder="Search shoes"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="input"
                    />
                </div>

                {/* Shoe Grid */}
                <div className="shoeGrid">
                    {filteredShoes.map((shoe) => (
                        <div key={shoe.id} className="shoeCard">
                            <img
                                src={shoe.image}
                                alt={shoe.name}
                                className="shoeImage"
                            />
                            <h4 className="shoeTitle">{shoe.name}</h4>
                            <p className="shoePrice">${shoe.price}</p>
                            <p className="shoeDescription">{shoe.description}</p>
                            <div className="shoeActions">
                                <button
                                    onClick={() => handleEditShoe(shoe, setForm, setEditingShoeId)}
                                    className="editButton"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteShoe(shoe.id)}
                                    className="deleteButton"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
