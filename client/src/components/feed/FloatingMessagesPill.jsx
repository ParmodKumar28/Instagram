import { useSelector } from "react-redux";
import { usersSelector } from "../../redux/slices/usersSlice";
import { PiPaperPlaneTiltFill } from "react-icons/pi";

export function FloatingMessagesPill() {
  const { signedUser } = useSelector(usersSelector);
  const currentUser = signedUser;

  return (
    <div className="fixed bottom-5 right-6 z-30 hidden md:flex items-center space-x-3 bg-white border border-gray-200 rounded-full shadow-lg py-2.5 px-4 cursor-pointer hover:shadow-xl transition-all duration-200 select-none">
      <div className="relative flex items-center">
        <PiPaperPlaneTiltFill className="text-xl text-gray-800" />
        <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center border border-white">
          1
        </span>
      </div>

      <span className="font-semibold text-sm text-gray-900">Messages</span>

      {currentUser && (
        <img
          src={currentUser.profilePic || "https://placekitten.com/100/100"}
          alt="Avatar"
          className="w-6 h-6 rounded-full object-cover border border-gray-200"
        />
      )}
    </div>
  );
}

export default FloatingMessagesPill;
