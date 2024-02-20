// JSX Component for App parent component includes routes
// Imports
import { createBrowserRouter } from "react-router-dom";
import SignUp from "./Components/Signup/Signup";
import Login from "./Components/Login/Login";

const App = () => {
  // Creating router
  // const router = createBrowserRouter([
  //   {
  //   }
  // ])
  return (
    <>
      {/* <SignUp /> */}
      <Login />
    </>
  )
}

// Exporting App
export default App