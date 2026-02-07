// useAuth.js (or whatever file contains your custom hook)

const useAuth = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? true : false; // Return true if user exists, else false
};

export default useAuth;
