// JSX Component for App parent component includes routes
// Imports
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import store from "./Redux/store";
import { Flip, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components Imports
import RegisterPage from "./Pages/App/Register Page/Register-Page";
import LoginPage from "./Pages/App/Login Page/Login-Page";
import ForgotPasswordPage from "./Pages/App/Forgot-Password Page/Forgot-Password-Page";
import ResetPasswordPage from "./Pages/App/Reset Password Page/Reset-Password-Page";

// Css imports
import "./App.css";

// Function App component this is a parent component here
const App = () => {
  // Creating router
  const router = createBrowserRouter([
    { path: "/sign-up", element: <RegisterPage /> },
    { path: "Login", element: <LoginPage /> },
    { path: "forgot-password", element: <ForgotPasswordPage /> },
    { path: "reset-password", element: <ResetPasswordPage /> }
  ]);

  // Returning JSX
  return (
    <>
      {/* Providing store */}
      <Provider store={store}>
        {/* Router */}
        <RouterProvider router={router} />
      </Provider>
      {/* Notifications */}
      <ToastContainer autoClose={1000} transition={Flip} />
    </>
  )
}

// Exporting App
export default App