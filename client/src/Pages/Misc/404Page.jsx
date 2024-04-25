// Imports
import { useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router
import { useNavigate } from 'react-router-dom';

// 404 Error componenet is here
function NotFound() {

    // Navigator
    const navigate = useNavigate();

    // Function to go back to home page
    const goBack = () => {
        setTimeout(() => {
            navigate("/");
        }, 2000);
    }

    useEffect(() => {
        goBack();
    }, []);

    // Returning Jsx
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
            <Link to="/" className="text-blue-500 hover:underline">Go back to Home</Link>
        </div>
    );
}

// Exporting NotFound
export default NotFound;
