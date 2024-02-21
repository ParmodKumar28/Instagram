// JSX Component for App parent component includes routes
// Imports
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Components Imports
import RegisterPage from "./Pages/App/Register Page/Register-Page";
import LoginPage from "./Pages/App/Login Page/Login-Page";
import ForgotPasswordPage from "./Pages/App/Forgot-Password Page/Forgot-Password-Page";

// Css imports
import "./App.css";


// Function App component this is a parent component here
const App = () => {
  // Creating router
  const router = createBrowserRouter([
    { path: "/sign-up", element: <RegisterPage /> },
    { path: "Login", element: <LoginPage /> },
    { path: "forgot-password", element: <ForgotPasswordPage /> }
  ]);

  // Returning JSX
  return (
    <>
      {/* Router */}
      <RouterProvider router={router} />
    </>
  )
}

// Exporting App
export default App