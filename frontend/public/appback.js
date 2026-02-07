import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hamburger from "./components/Hamburger";
import Home from "./components/Home";
import ShoeList from "./components/ShoeList";
import ShoeDetails from "./components/ShoeDetails";
import BuyNowPage from "./components/BuyNowPage";
import AdminPanel from "./components/AdminPanel";
import ContactUs from "./components/ContactUs";
import Logo from "./components/Logo";

const App = () => {
    const [shoes, setShoes] = useState([]);
    const [contact, setContact] = useState({
        email: "",
        phone: "",
        address: "",
    });
    const [loadingContact, setLoadingContact] = useState(true); // Track loading state for contact data

    // Fetch shoes from API on component mount
    useEffect(() => {
        fetch("http://localhost:5000/api/shoes")
            .then((response) => response.json())
            .then((data) => setShoes(data))
            .catch((error) => console.error("Error fetching shoes:", error));
    }, []);

    // Fetch contact information from API
    useEffect(() => {
        fetch("http://localhost:5000/api/contact")
            .then((response) => response.json())
            .then((data) => {
                setContact(data);
                setLoadingContact(false); // Set loading to false once data is fetched
            })
            .catch((error) => console.error("Error fetching contact info:", error));
    }, []);

    // Add new shoe via API
    const addShoe = (newShoe) => {
        fetch("http://localhost:5000/api/shoes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newShoe),
        })
            .then((response) => response.json())
            .then((data) => setShoes((prevShoes) => [...prevShoes, data]))
            .catch((error) => console.error("Error adding shoe:", error));
    };

    // Update shoe via API
    const updateShoe = (updatedShoe, id) => {
        fetch(`http://localhost:5000/api/shoes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedShoe),
        })
            .then((response) => response.json())
            .then((data) => {
                // Update the local state to replace the edited shoe
                setShoes((prevShoes) =>
                    prevShoes.map((shoe) => (shoe.id === id ? data : shoe))
                );
            })
            .catch((error) => console.error("Error updating shoe:", error));
    };

    // Delete shoe via API
    const deleteShoe = (id) => {
        // Avoid multiple clicks or unnecessary duplicate API calls
        if (!id) return; // Check if the id is valid

        console.log("Attempting to delete shoe with id:", id);

        // Disable delete button temporarily to prevent multiple requests
        const button = document.getElementById(`delete-button-${id}`);
        if (button) {
            button.disabled = true;
        }

        fetch(`http://localhost:5000/api/shoes/${id}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Shoe deleted successfully, removing from state");
                    // Remove the shoe from the local state
                    setShoes((prevShoes) => prevShoes.filter((shoe) => shoe.id !== id));

                    // Refresh the page after successful deletion
                    window.location.reload();
                } else {
                    throw new Error("Failed to delete shoe");
                }
            })
            .catch((error) => {
                console.error("Error deleting shoe:", error);
                alert("There was an error deleting the shoe. Please try again.");
            })
            .finally(() => {
                // Re-enable the button after the request completes
                if (button) {
                    button.disabled = false;
                }
            });
    };




    // Update contact information via API
    const updateContact = (updatedContact) => {
        fetch("http://localhost:5000/api/contact", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedContact),
        })
            .then((response) => response.json())
            .then((data) => {
                setContact(data); // Update state with new contact data
            })
            .catch((error) => console.error("Error updating contact info:", error));
    };

    const [selectedShoe, setSelectedShoe] = useState(null);

    return (
        <Router>
            <Hamburger />
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Logo shoes={shoes} />
                            <div style={{ marginTop: "20vh" }}>
                                <Home
                                    shoes={shoes}
                                    onSelectShoe={(id) =>
                                        setSelectedShoe(shoes.find((shoe) => shoe.id === id))
                                    }
                                />
                            </div>
                        </>
                    }
                />
                <Route
                    path="/list"
                    element={
                        <ShoeList
                            shoes={shoes}
                            onSelectShoe={(id) =>
                                setSelectedShoe(shoes.find((shoe) => shoe.id === id))
                            }
                            onDeleteShoe={deleteShoe}
                        />
                    }
                />
                <Route
                    path="/details"
                    element={
                        <ShoeDetails
                            shoe={selectedShoe}
                            onBack={() => setSelectedShoe(null)}
                        />
                    }
                />
                <Route path="/buy-now" element={<BuyNowPage shoe={selectedShoe} />} />
                <Route
                    path="/admin"
                    element={
                        <AdminPanel
                            shoes={shoes}
                            setShoes={setShoes}  // Add this line to pass setShoes to AdminPanel
                            addShoe={addShoe}
                            updateShoe={updateShoe}
                            deleteShoe={deleteShoe}
                            contact={contact}
                            updateContact={updateContact}
                            loadingContact={loadingContact}
                        />
                    }
                />
                <Route
                    path="/contact"
                    element={<ContactUs contact={contact} updateContact={updateContact} />}
                />
            </Routes>
        </Router>
    );
};

export default App;
