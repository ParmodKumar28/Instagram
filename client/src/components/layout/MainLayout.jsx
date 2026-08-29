import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import Header from "./Header";
import Footer from "./Footer";
import FloatingMessagesPill from "../feed/FloatingMessagesPill";
import { userDataAsync } from "../../redux/slices/usersSlice";
import { fetchSavedPostsAsync } from "../../redux/slices/postsSlice";

export function MainLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(userDataAsync());
    dispatch(fetchSavedPostsAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Desktop Left Navigation Rail */}
      <div className="hidden md:block">
        <LeftSidebar />
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden">
        <Header />
      </div>

      {/* Main Content View (Responsive margin and padding) */}
      <main className="flex-1 md:ml-[84px] min-h-screen pt-12 md:pt-0 pb-14 md:pb-0 bg-white">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <Footer />
      </div>

      {/* Desktop Floating Messages Widget */}
      <FloatingMessagesPill />
    </div>
  );
}

export default MainLayout;
