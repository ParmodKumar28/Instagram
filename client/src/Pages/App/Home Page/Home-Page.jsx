// Imports
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutAsync, userDataAsync } from "../../../Redux/Reducer/usersReducer";
import { Outlet, useNavigate } from "react-router-dom";
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
            <div className="pb-10">
                <Outlet />
            </div>
            <Footer />
        </>
    )
}

// Exporting HomePage
export default HomePage;