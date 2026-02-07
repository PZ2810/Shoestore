import React, { useState, useEffect } from "react";

const AdminPanel = ({
    shoes,
    addShoe,
    setShoes, // Add setShoes here
    updateShoe,
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

    useEffect(() => {
        if (contact.email) {
            setLoadingContact(false); // Set loading to false once contact data is available
        }
    }, [contact]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prev) => ({ ...prev, image: file })); // Store the file, not the blob URL
        }
    };



    const handleAddShoe = (e) => {
        e.preventDefault();

        if (form.name && form.price && form.description && form.image) {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("description", form.description);
            formData.append("image", form.image); // Add the image file to the FormData

            // Send the formData to the server for shoe addition
            fetch("http://localhost:5000/api/shoes", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    // Ensure that the new shoe is not added twice in the state
                    setShoes((prevShoes) => {
                        if (!prevShoes.find((shoe) => shoe.id === data.id)) {
                            return [...prevShoes, data]; // Add the shoe if it's not already present
                        }
                        return prevShoes;
                    });
                    setForm({ name: "", price: "", description: "", image: "" }); // Reset the form

                    // Refresh the page after successful addition
                    window.location.reload();
                })
                .catch((error) => console.error("Error adding shoe:", error));
        } else {
            alert("All fields are required!");
        }
    };





    const handleEditShoe = (shoe) => {
        setForm({
            name: shoe.name,
            price: shoe.price,
            description: shoe.description,
            image: shoe.image, // Keep existing image URL
        }); // Populate form with existing shoe details
        setEditingShoeId(shoe.id); // Set the shoe ID being edited
    };

    const handleUpdateShoe = (e) => {
        e.preventDefault();

        if (form.name && form.price && form.description) {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("description", form.description);

            // If a new image is selected, append it to formData
            if (form.image instanceof File) {
                formData.append("image", form.image);
            } else {
                // Otherwise, send the existing image URL (or skip it if not updating the image)
                formData.append("image", form.image || "");
            }

            // Send the formData to the server for shoe update
            fetch(`http://localhost:5000/api/shoes/${editingShoeId}`, {
                method: "PUT",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    // Update the shoes in state with the updated shoe data
                    setShoes((prevShoes) =>
                        prevShoes.map((shoe) => (shoe.id === editingShoeId ? data : shoe))
                    );
                    setForm({ name: "", price: "", description: "", image: "" }); // Reset the form
                    setEditingShoeId(null); // Exit editing mode

                    // Refresh the page after successful update
                    window.location.reload();
                })
                .catch((error) => console.error("Error updating shoe:", error));
        } else {
            alert("All fields are required!");
        }
    };


    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateContact = (e) => {
        e.preventDefault();

        updateContact(contactForm); // Update in the parent component
        alert("Contact details updated!");
        window.location.reload(); // Auto-refresh
    };


    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Admin Panel</h2>

            {/* Add or Edit Shoe Form */}
            <form onSubmit={editingShoeId ? handleUpdateShoe : handleAddShoe} style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Shoe Name"
                    value={form.name}
                    onChange={handleInputChange}
                    style={{ margin: "5px", padding: "5px" }}
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleInputChange}
                    style={{ margin: "5px", padding: "5px" }}
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleInputChange}
                    style={{ margin: "5px", padding: "5px", resize: "none" }}
                />
                <input
                    type="text"
                    name="image"
                    placeholder="Image URL"
                    value={form.image}
                    onChange={handleInputChange}
                    style={{ margin: "5px", padding: "5px" }}
                />
                {/* Local file upload */}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ margin: "5px", padding: "5px" }}
                />
                <button type="submit" style={{ margin: "5px", padding: "5px" }}>
                    {editingShoeId ? "Update Shoe" : "Add Shoe"}
                </button>
            </form>

            {/* Contact Details Form */}
            <h3>Contact Details</h3>
            {loadingContact ? (
                <div>Loading contact details...</div>
            ) : (
                <form onSubmit={handleUpdateContact} style={{ marginBottom: "20px" }}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        style={{ margin: "5px", padding: "5px" }}
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        style={{ margin: "5px", padding: "5px" }}
                    />
                    <textarea
                        name="address"
                        placeholder="Address"
                        value={contactForm.address}
                        onChange={handleContactChange}
                        style={{ margin: "5px", padding: "5px", resize: "none" }}
                    />
                    <button type="submit" style={{ margin: "5px", padding: "5px" }}>
                        Update Contact
                    </button>
                </form>
            )}

            {/* Shoe Inventory */}
            <h3>Current Inventory</h3>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                {shoes.map((shoe) => (
                    <div
                        key={shoe.id}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "10px",
                            padding: "10px",
                            textAlign: "center",
                            width: "200px",
                        }}
                    >
                        <img
                            src={shoe.image}
                            alt={shoe.name}
                            style={{ width: "100%", height: "150px", objectFit: "cover" }}
                        />
                        <h4>{shoe.name}</h4>
                        <p>${shoe.price}</p>
                        <p>{shoe.description}</p>
                        <button onClick={() => handleEditShoe(shoe)} style={{ color: "blue" }}>
                            Edit
                        </button>
                        <button onClick={() => deleteShoe(shoe.id)} style={{ color: "red" }}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;
