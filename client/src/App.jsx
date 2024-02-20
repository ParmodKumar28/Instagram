// JSX Component for App parent component includes routes
// Imports
import { createBrowserRouter } from "react-router-dom";
import SignUp from "./Components/Signup/Signup";

const App = () => {
  // Creating router
  // const router = createBrowserRouter([
  //   {
  //   }
  // ])
  return (
    <>
      <SignUp />
    </>
  )
}

// Exporting App
export default App