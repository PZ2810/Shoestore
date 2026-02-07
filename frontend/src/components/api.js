// api.js

// Fetch shoes from API
export const fetchShoes = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/shoes");
        return await response.json();
    } catch (error) {
        console.error("Error fetching shoes:", error);
        throw error;
    }
};

// Fetch contact information from API
export const fetchContact = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/contact");
        return await response.json();
    } catch (error) {
        console.error("Error fetching contact info:", error);
        throw error;
    }
};

// Add new shoe via API
export const addShoe = async (newShoe) => {
    try {
        const response = await fetch("http://localhost:5000/api/shoes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newShoe),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding shoe:", error);
        throw error;
    }
};

// Update shoe via API
export const updateShoe = async (updatedShoe, id) => {
    try {
        const response = await fetch(`http://localhost:5000/api/shoes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedShoe),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating shoe:", error);
        throw error;
    }
};

// Delete shoe via API
export const deleteShoe = async (id) => {
    try {
        const response = await fetch(`http://localhost:5000/api/shoes/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to delete shoe");
        }
        return response.ok;
    } catch (error) {
        console.error("Error deleting shoe:", error);
        throw error;
    }
};

// Update contact information via API
export const updateContact = async (updatedContact) => {
    try {
        const response = await fetch("http://localhost:5000/api/contact", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedContact),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating contact info:", error);
        throw error;
    }
};
