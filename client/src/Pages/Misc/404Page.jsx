// Imports
import { useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router
import { useNavigate } from 'react-router-dom';

// 404 Error component is here
function NotFound() {

    // Navigator
    const navigate = useNavigate();

    // Function to go back to home page
    const goBack = () => {
        setTimeout(() => {
            navigate("/");
        }, 5000);
    }

    useEffect(() => {
        goBack();
    }, []);

    // Returning Jsx
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-slate-600" style={{ backgroundImage: "url('instagram-background.jpg')" }}>
            <h1 className="text-9xl font-bold text-white mb-4">Oops!</h1>
            <p className="text-4xl text-white mb-8">We couldn't find the page you're looking for.</p>
            <Link to="/" className="text-2xl text-white bg-blue-500 px-8 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300">Take me home</Link>
        </div>
    );
}

// Exporting NotFound
export default NotFound;
