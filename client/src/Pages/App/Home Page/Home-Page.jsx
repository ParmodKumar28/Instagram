// Imports
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutAsync, userDataAsync } from "../../../Redux/Reducer/usersReducer";
import { useNavigate } from "react-router-dom";
import Footer from "../../../Components/Footer/Footer";
import Header from "../../../Components/Header/Header";

// Home page functional component is here
function HomePage() {
    // State's

    // Reducer's state's

    const navigate = useNavigate();

    // Dispatcher
    const dispatch = useDispatch();

    // Side effect's
    useEffect(() => {
        // Dispatching action's 
        dispatch(userDataAsync());
    }, []);

    // Returning JSX
    return (
        <>
            <Header />
            <h1>Welcome To Instagram</h1>
            <button onClick={() => { dispatch(logoutAsync()); navigate("/login") }}>Logout</button>
            <Footer />
        </>
    )
}

// Exporting HomePage
export default HomePage;