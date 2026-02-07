import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hamburger from "./components/Hamburger";
import Home from "./components/Home";
import ShoeList from "./components/ShoeList";
import ShoeDetails from "./components/ShoeDetails";
import BuyNowPage from "./components/BuyNowPage";
import AdminPanel from "./components/AdminPanel";
import ContactUs from "./components/ContactUs";
import Login from './components/Login';
import Signup from './components/Signup';
import Signout from './components/Signout';
import Cart from "./components/Cart"; // Import the Cart page component
import Profile from "./components/Profile"; // Import the Cart page component
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Orders from './components/Orders';
import Chatbot from "./components/Chatbot"; // Import Chatbot component


// Import API functions
import {
  fetchShoes,
  fetchContact,
  addShoe,
  updateShoe,
  deleteShoe,
  updateContact,
} from "./components/api";

const App = () => {
  const [shoes, setShoes] = useState([]);
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    address: "",
  });
  const [loadingContact, setLoadingContact] = useState(true);
  const [randomShoes, setRandomShoes] = useState([]); // Randomized 10 shoes for the home page
  const [searchQuery, setSearchQuery] = useState("");


  const getRandomShoes = (shoesArray) => {
    const shuffled = [...shoesArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8); // Get first 10 after shuffling
  };

  useEffect(() => {
    fetchShoes()
      .then((data) => {
        setShoes(data);

        // Select only 10 random shoes after fetching
        const randomSelection = getRandomShoes(data);
        setRandomShoes(randomSelection);
      })
      .catch((error) => console.error("Error fetching shoes:", error));
  }, []);

  // Fetch shoes from API on component mount
  useEffect(() => {
    fetchShoes()
      .then((data) => setShoes(data))
      .catch((error) => console.error("Error fetching shoes:", error));
  }, []);

  // Fetch contact information from API
  useEffect(() => {
    fetchContact()
      .then((data) => {
        setContact(data);
        setLoadingContact(false);
      })
      .catch((error) => console.error("Error fetching contact info:", error));
  }, []);

  // Handle selecting a shoe
  const handleSelectShoe = (id) => {
    const shoe = shoes.find((shoe) => shoe.id === id);
    localStorage.setItem("selectedShoe", JSON.stringify(shoe));
  };

  // Filter shoes based on the search query
  const filteredShoes = shoes.filter(
    (shoe) =>
      shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shoe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new shoe via API
  const handleAddShoe = (newShoe) => {
    addShoe(newShoe)
      .then((data) => setShoes((prevShoes) => [...prevShoes, data]))
      .catch((error) => console.error("Error adding shoe:", error));
  };

  // Update shoe via API
  const handleUpdateShoe = (updatedShoe, id) => {
    updateShoe(updatedShoe, id)
      .then((data) => {
        setShoes((prevShoes) =>
          prevShoes.map((shoe) => (shoe.id === id ? data : shoe))
        );
      })
      .catch((error) => console.error("Error updating shoe:", error));
  };

  // Delete shoe via API
  const handleDeleteShoe = (id) => {
    if (!id) return;

    const button = document.getElementById(`delete-button-${id}`);
    if (button) {
      button.disabled = true;
    }

    deleteShoe(id)
      .then(() => {
        setShoes((prevShoes) => prevShoes.filter((shoe) => shoe.id !== id));
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error deleting shoe:", error);
        alert("There was an error deleting the shoe. Please try again.");
      })
      .finally(() => {
        if (button) {
          button.disabled = false;
        }
      });
  };

  // Update contact information via API
  const handleUpdateContact = (updatedContact) => {
    updateContact(updatedContact)
      .then((data) => setContact(data))
      .catch((error) => console.error("Error updating contact info:", error));
  };

  return (
    <Router>
      <Hamburger
        shoes={shoes}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredShoes={filteredShoes}
        onSelectShoe={handleSelectShoe}
      />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div style={{ marginTop: "0vh" }}>
                {/* Pass only 10 random shoes to Home */}
                <Home shoes={randomShoes} onSelectShoe={handleSelectShoe} />
              </div>
            </>
          }
        />
        <Route
          path="/list"
          element={
            <ShoeList
              shoes={shoes}
              onSelectShoe={handleSelectShoe}
              onDeleteShoe={handleDeleteShoe}
            />
          }
        />
        {/* Use a dynamic route for the shoe details */}
        <Route
          path="/details/:id"
          element={<ShoeDetails shoes={shoes} />}
        />
        <Route path="/buy-now/:id" element={<BuyNowPage shoes={shoes} />} />
        <Route
          path="/admin"
          element={
            <AdminPanel
              shoes={shoes}
              setShoes={setShoes}
              addShoe={handleAddShoe}
              updateShoe={handleUpdateShoe}
              deleteShoe={handleDeleteShoe}
              contact={contact}
              updateContact={handleUpdateContact}
              loadingContact={loadingContact}
            />
          }
        />
        <Route
          path="/contact"
          element={<ContactUs contact={contact} updateContact={handleUpdateContact} />}
        />
        <Route path="/login" element={<Login />} />  {/* Correct Login route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signout" element={<Signout />} />
        <Route path="/cart" element={<Cart />} /> {/* Cart page route */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
      <Chatbot /> {/* Include the chatbot */}
    </Router>
  );
};

export default App;
