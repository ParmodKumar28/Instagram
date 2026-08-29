import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { userDataAsync } from "../../redux/slices/usersSlice";

export function MainLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(userDataAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />
      <main className="flex-1 pb-20 max-w-4xl w-full mx-auto px-2 sm:px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
