import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import FloatingMessagesPill from "../feed/FloatingMessagesPill";
import { userDataAsync } from "../../redux/slices/usersSlice";

export function MainLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(userDataAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Fixed Left Navigation Rail */}
      <LeftSidebar />

      {/* Main Content View with comfortable left margin */}
      <main className="flex-1 ml-[84px] min-h-screen bg-white">
        <Outlet />
      </main>

      {/* Floating Bottom-Right Messages Widget */}
      <FloatingMessagesPill />
    </div>
  );
}

export default MainLayout;
