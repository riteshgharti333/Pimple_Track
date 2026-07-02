import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";

// Pages
import Homepage from "./pages/Homepage";
import Add from "./pages/Add";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

// Layout
import NavBar from "./components/NavBar";
import BottomBar from "./components/BottomBar";
import Update from "./pages/Update";
import { Toaster } from "sonner";

const AppLayout = () => {
  return (
    <div className="app-container">
      <NavBar />
      <Outlet />
      <BottomBar />
    </div>
  );
};

function App() {
  return (
    <div className="app max-w-md mx-auto shadow-2xl">
      <Routes>
        {/* Login route (no layout) */}
        <Route path="/login" element={<Login />} />

        {/* App routes (with layout) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/add" element={<Add />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update/:id" element={<Update />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
