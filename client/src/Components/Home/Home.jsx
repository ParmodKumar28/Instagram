// Import's
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAsync } from "../../Redux/Reducer/usersReducer";
import PostsList from "../Post's List/Post's-List";

// Component to show home data like posts
function Home() {

    // Navigate and dispatcher
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Returning Jsx
    return (
        <>
            <PostsList />
            <button onClick={() => { dispatch(logoutAsync()); navigate("/login") }}>Logout</button>
        </>
    )
}

// Exporting home
export default Home