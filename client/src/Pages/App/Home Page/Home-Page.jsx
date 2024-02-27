// Imports
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { userDataAsync } from "../../../Redux/Reducer/usersReducer";

// Home page functional component is here
function HomePage() {
    // State's

    // Reducer's state's

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
            <h1>Welcome To Instagram</h1>
        </>
    )
}

// Exporting HomePage
export default HomePage;