import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import store from "./redux/store";
import router from "./routes/appRouter";
import { SocketProvider } from "./context/SocketContext";
import "./App.css";

const App = () => {
  return (
    <Provider store={store}>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" reverseOrder={false} />
      </SocketProvider>
    </Provider>
  );
};

export default App;


