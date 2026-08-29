import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import store from "./Redux/store";
import router from "./routes/appRouter";
import "./App.css";

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </Provider>
  );
};

export default App;


