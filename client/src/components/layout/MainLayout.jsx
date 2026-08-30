import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import Header from "./Header";
import Footer from "./Footer";
import QuickChatDrawer from "../chat/QuickChatDrawer";
import { userDataAsync } from "../../redux/slices/usersSlice";
import { fetchSavedPostsAsync } from "../../redux/slices/postsSlice";

export function MainLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");

  useEffect(() => {
    dispatch(userDataAsync());
    dispatch(fetchSavedPostsAsync());
  }, [dispatch]);

  return (
    <div className={`w-full bg-white flex flex-col md:flex-row ${isMessagesPage ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      {/* Desktop Left Navigation Rail */}
      <div className="hidden md:block flex-shrink-0">
        <LeftSidebar />
      </div>

      {/* Mobile Top Header */}
      {!isMessagesPage && (
        <div className="md:hidden flex-shrink-0">
          <Header />
        </div>
      )}

      {/* Main Content View (Responsive margin and padding) */}
      <main
        className={`flex-1 md:ml-[84px] bg-white ${
          isMessagesPage
            ? "h-screen max-h-screen overflow-hidden p-0"
            : "min-h-screen pt-12 md:pt-0 pb-14 md:pb-0"
        }`}
      >
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!isMessagesPage && (
        <div className="md:hidden flex-shrink-0">
          <Footer />
        </div>
      )}

      {/* Quick Access Chat Drawer / Floating Messenger (hidden on full messages page) */}
      {!isMessagesPage && <QuickChatDrawer />}
    </div>
  );
}

export default MainLayout;
