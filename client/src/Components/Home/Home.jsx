// Import's
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAsync } from "../../Redux/Reducer/usersReducer";

// Component to show home data like posts
function Home() {

    // Navigate and dispatcher
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Returning Jsx
    return (
        <>
            <div>Home</div>
            <button onClick={() => { dispatch(logoutAsync()); navigate("/login") }}>Logout</button>
        </>
    )
}

// Exporting home
export default Home