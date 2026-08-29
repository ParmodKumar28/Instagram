import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import ProtectedRoute from "../Pages/Misc/Protected Routes/ProtectedRoute";

const RegisterPage = lazy(() => import("../Pages/App/Register Page/Register-Page"));
const LoginPage = lazy(() => import("../Pages/App/Login Page/Login-Page"));
const ForgotPasswordPage = lazy(() => import("../Pages/App/Forgot-Password Page/Forgot-Password-Page"));
const ResetPasswordPage = lazy(() => import("../Pages/App/Reset Password Page/Reset-Password-Page"));
const HomePage = lazy(() => import("../Pages/App/Home Page/Home-Page"));
const Home = lazy(() => import("../Components/Home/Home"));
const PostForm = lazy(() => import("../Components/Post Form/PostForm"));
const UserPage = lazy(() => import("../Pages/App/User Page/UserPage"));
const PostPage = lazy(() => import("../Pages/App/PostPage/PostPage"));
const EditProfileForm = lazy(() => import("../Components/Edit Profile Form/EditProfileForm"));
const FollowerList = lazy(() => import("../Components/FollowerList/FollowerList"));
const FollowingList = lazy(() => import("../Components/FollowingList/FollowingList"));
const NotFound = lazy(() => import("../Pages/Misc/404Page"));

const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
    <ColorRing
      visible={true}
      height="60"
      width="60"
      ariaLabel="loading"
      colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
    />
  </div>
);

const withSuspense = (Element) => (
  <Suspense fallback={<PageLoader />}>{Element}</Suspense>
);

export const router = createBrowserRouter([
  { path: "/sign-up", element: withSuspense(<RegisterPage />) },
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/forgot-password", element: withSuspense(<ForgotPasswordPage />) },
  { path: "/reset-password", element: withSuspense(<ResetPasswordPage />) },
  {
    path: "/",
    element: withSuspense(
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
    errorElement: withSuspense(<NotFound />),
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: "new-post", element: withSuspense(<PostForm />) },
      { path: "profile/:userId", element: withSuspense(<UserPage />) },
      { path: "post/:postId", element: withSuspense(<PostPage />) },
      { path: "edit-profile", element: withSuspense(<EditProfileForm />) },
      { path: "followers/:userId", element: withSuspense(<FollowerList />) },
      { path: "following/:userId", element: withSuspense(<FollowingList />) },
    ],
  },
  { path: "*", element: withSuspense(<NotFound />) },
]);

export default router;
