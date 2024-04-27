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
import HomePage from "./Pages/App/Home Page/Home-Page";
import ProtectedRoute from "./Pages/Misc/Protected Routes/ProtectedRoute";

// Css imports
import "./App.css";
import PostForm from "./Components/Post Form/PostForm";
import Footer from "./Components/Footer/Footer";
import Home from "./Components/Home/Home";
import NotFound from "./Pages/Misc/404Page";
import Post from "./Components/Post/Post";
import PostPage from "./Pages/App/PostPage/PostPage";
import UserPage from "./Pages/App/User Page/UserPage";
import EditProfileForm from "./Components/Edit Profile Form/EditProfileForm";

// Function App component this is a parent component here
const App = () => {
  // Creating router
  const router = createBrowserRouter([
    { path: "/sign-up", element: <RegisterPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    {
      path: "/",
      element: <ProtectedRoute><HomePage /></ProtectedRoute>,
      errorElement: <NotFound />,
      children: [
        {
          index: true, element: <Home />  
        },
        { path: "new-post", element: <PostForm /> },
        { path: "profile/:userId", element: <UserPage /> },
        { path: "/post/:postId", element: <PostPage /> },
        { path: "/edit-profile", element: <EditProfileForm /> }
      ]
    }
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
      <ToastContainer autoClose={2000} transition={Flip} />
    </>
  )
}

// Exporting App
export default App;
