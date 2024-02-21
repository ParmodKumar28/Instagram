// JSX Component for App parent component includes routes
// Imports
// import { createBrowserRouter } from "react-router-dom";
import SignUp from "./Components/Signup/Signup";
import Login from "./Components/Login/Login";
import ForgotPassword from "./Components/Forgot Password/ForgotPassword";

const App = () => {
  // Creating router
  // const router = createBrowserRouter([
  //   {
  //   }
  // ])
  return (
    <>
      <SignUp />
      {/* <Login /> */}
      {/* <ForgotPassword /> */}
    </>
  )
}

// Exporting App
export default App