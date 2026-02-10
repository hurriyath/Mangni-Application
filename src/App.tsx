import { useState, useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

import HomeScreen from "./screens/HomeScreen";
import AddProfile from "./screens/AddProfile";
import FindMatches from "./screens/FindMatches";
import AdminDashboard from "./screens/AdminDashboard";
import EditProfile from "./screens/EditProfile";

export default function App() {
  const [screenStack, setScreenStack] = useState<string[]>(["home"]);

  const currentScreen = screenStack[screenStack.length - 1];

  // Navigate forward
  const navigate = (screen: string) => {
    setScreenStack(prev => [...prev, screen]);
  };

  // Go back
  const goBack = () => {
    setScreenStack(prev => {
      if (prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
  };

  // Android hardware back button (for future APK)
  useEffect(() => {
  let handler: any;

  const setup = async () => {
    handler = await CapacitorApp.addListener("backButton", () => {
      if (screenStack.length > 1) {
        goBack();
      } else {
        CapacitorApp.exitApp();
      }
    });
  };

  setup();

  return () => {
    if (handler) handler.remove();
  };
}, [screenStack]);


  return (
    <>
      {currentScreen === "home" && <HomeScreen onNavigate={navigate} />}
      {currentScreen === "add-profile" && <AddProfile onNavigate={navigate} />}
      {currentScreen === "find-matches" && <FindMatches onNavigate={navigate} />}
      {currentScreen === "admin-dashboard" && <AdminDashboard onNavigate={navigate} />}
      {currentScreen === "edit-profile" && <EditProfile onNavigate={navigate} />}
    </>
  );
}
