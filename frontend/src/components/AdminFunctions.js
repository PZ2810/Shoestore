// AdminFunctions.js
export const handleInputChange = (e, form, setForm) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
};

export const handleFileChange = (e, form, setForm) => {
    const file = e.target.files[0];
    if (file) {
        setForm((prev) => ({ ...prev, image: file }));
    }
};

export const handleAddShoe = (e, form, setShoes, setForm) => {
    e.preventDefault();

    if (form.name && form.price && form.description && form.image) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("price", form.price);
        formData.append("description", form.description);
        formData.append("image", form.image);

        fetch("http://localhost:5000/api/shoes", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setShoes((prevShoes) => {
                    if (!prevShoes.find((shoe) => shoe.id === data.id)) {
                        return [...prevShoes, data];
                    }
                    return prevShoes;
                });
                setForm({ name: "", price: "", description: "", image: "" });
                window.location.reload();
            })
            .catch((error) => console.error("Error adding shoe:", error));
    } else {
        alert("All fields are required!");
    }
};

export const handleEditShoe = (shoe, setForm, setEditingShoeId) => {
    setForm({
        name: shoe.name,
        price: shoe.price,
        description: shoe.description,
        image: shoe.image,
    });
    setEditingShoeId(shoe.id);
};

export const handleUpdateShoe = (e, form, editingShoeId, setShoes, setForm, setEditingShoeId) => {
    e.preventDefault();

    if (form.name && form.price && form.description) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("price", form.price);
        formData.append("description", form.description);

        if (form.image instanceof File) {
            formData.append("image", form.image);
        } else {
            formData.append("image", form.image || "");
        }

        fetch(`http://localhost:5000/api/shoes/${editingShoeId}`, {
            method: "PUT",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setShoes((prevShoes) =>
                    prevShoes.map((shoe) => (shoe.id === editingShoeId ? data : shoe))
                );
                setForm({ name: "", price: "", description: "", image: "" });
                setEditingShoeId(null);
                window.location.reload();
            })
            .catch((error) => console.error("Error updating shoe:", error));
    } else {
        alert("All fields are required!");
    }
};

export const handleContactChange = (e, contactForm, setContactForm) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
};

export const handleUpdateContact = (e, contactForm, updateContact) => {
    e.preventDefault();
    updateContact(contactForm);
    alert("Contact details updated!");
    window.location.reload();
};
