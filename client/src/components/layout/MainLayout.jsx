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
  const isReelsPage = location.pathname === "/reels";

  useEffect(() => {
    dispatch(userDataAsync());
    dispatch(fetchSavedPostsAsync());
  }, [dispatch]);

  return (
    <div
      className={`w-full bg-[#fafafa] flex flex-col md:flex-row ${
        isMessagesPage || isReelsPage
          ? "h-[100dvh] max-h-[100dvh] overflow-hidden"
          : "min-h-screen"
      }`}
    >
      {/* Desktop Left Navigation Rail */}
      <div className="hidden md:block flex-shrink-0">
        <LeftSidebar />
      </div>

      {/* Mobile Top Header (Hidden on Messages and Reels for full immersion) */}
      {!isMessagesPage && !isReelsPage && (
        <div className="md:hidden flex-shrink-0">
          <Header />
        </div>
      )}

      {/* Main Content View (Responsive margin and padding) */}
      <main
        className={`flex-1 md:ml-[84px] ${
          isReelsPage
            ? "bg-transparent h-[calc(100dvh-48px)] md:h-screen overflow-hidden p-0"
            : isMessagesPage
            ? "bg-white h-[100dvh] max-h-[100dvh] overflow-hidden p-0"
            : "bg-transparent min-h-screen pt-12 md:pt-0 pb-16 md:pb-0"
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

      {/* Quick Access Chat Drawer / Floating Messenger (Mobile & Desktop) */}
      {!isMessagesPage && (
        <QuickChatDrawer />
      )}
    </div>
  );
}

export default MainLayout;
