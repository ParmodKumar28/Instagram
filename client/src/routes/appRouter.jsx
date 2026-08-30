/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import PageLoader from "../components/common/PageLoader";
import ProtectedRoute from "../components/common/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

// Lazy-loaded Views
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));

const HomePage = lazy(() => import("../pages/feed/HomePage"));
const ExplorePage = lazy(() => import("../pages/explore/ExplorePage"));
const ReelsPage = lazy(() => import("../pages/reels/ReelsPage"));
const CreatePostPage = lazy(() => import("../pages/post/CreatePostPage"));
const PostDetailsPage = lazy(() => import("../pages/post/PostDetailsPage"));

const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/profile/EditProfilePage"));
const FollowersPage = lazy(() => import("../pages/profile/FollowersPage"));
const FollowingPage = lazy(() => import("../pages/profile/FollowingPage"));

const NotFoundPage = lazy(() => import("../pages/misc/NotFoundPage"));

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>{Component}</Suspense>
);

export const router = createBrowserRouter([
  // Public Auth Routes
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/sign-up", element: withSuspense(<SignupPage />) },
  { path: "/forgot-password", element: withSuspense(<ForgotPasswordPage />) },
  { path: "/reset-password", element: withSuspense(<ResetPasswordPage />) },

  // Protected App Routes wrapped in MainLayout
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: withSuspense(<NotFoundPage />),
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "explore", element: withSuspense(<ExplorePage />) },
      { path: "search", element: withSuspense(<ExplorePage />) },
      { path: "reels", element: withSuspense(<ReelsPage />) },
      { path: "new-post", element: withSuspense(<CreatePostPage />) },
      { path: "post/:postId", element: withSuspense(<PostDetailsPage />) },
      { path: "profile/:userId", element: withSuspense(<ProfilePage />) },
      { path: "edit-profile", element: withSuspense(<EditProfilePage />) },
      { path: "followers/:userId", element: withSuspense(<FollowersPage />) },
      { path: "following/:userId", element: withSuspense(<FollowingPage />) },
    ],
  },

  // 404 Fallback
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export default router;
