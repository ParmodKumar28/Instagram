// Import's
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Protected Route component which checks if the user is signed in and has a token
function ProtectedRoute({ children }) {
    // Check if there is a token in the cookie
    const token = Cookies.get('token');
    const isSignIn = Cookies.get('isSignIn');
    // Returning JSX
    return token && isSignIn ? children : <Navigate to="/login" />;
}

// Exporting ProtectedRoute
export default ProtectedRoute;
