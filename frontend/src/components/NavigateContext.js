// NavigateContext.js
import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

// Create a context to provide the navigate function
const NavigateContext = createContext();

// Custom hook to use the navigate function
export const useAppNavigate = () => useContext(NavigateContext);

// Provider component to wrap the entire app
export const NavigateProvider = ({ children }) => {
    const navigate = useNavigate(); // useNavigate hook from react-router-dom

    return (
        <NavigateContext.Provider value={navigate}>
            {children}
        </NavigateContext.Provider>
    );
};
