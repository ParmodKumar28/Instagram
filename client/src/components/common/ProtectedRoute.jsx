import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usersSelector } from "../../redux/slices/usersSlice";

export function ProtectedRoute({ children }) {
  const { isSignIn, token } = useSelector(usersSelector);
  const isAuthenticated =
    (isSignIn && Boolean(token)) || Boolean(localStorage.getItem("auth-token"));

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
