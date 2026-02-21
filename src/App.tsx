import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { getExploreHandling } from "./backButtonState";

import HomeScreen from "./screens/HomeScreen";
import AddProfile from "./screens/AddProfile";
import FindMatches from "./screens/FindMatches";
import AdminDashboard from "./screens/AdminDashboard";
import EditProfile from "./screens/EditProfile";
import Explore from "./screens/Explore";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      // If Explore is handling it, do nothing
      if (getExploreHandling()) {
        return;
      }

      if (location.pathname === '/') {
        CapacitorApp.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, [navigate, location]);

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/add-profile" element={<AddProfile />} />
      <Route path="/find-matches" element={<FindMatches />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  );
}