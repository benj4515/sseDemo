import "./App.css";
import Chats from "./Chats";
import Login from "./Login";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "chat", // relative, becomes /chat
        element: <Chats />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
