import React, { useState } from "react";
import Dashboard from "./Dashboard";
import Login from "./Login";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const handleAuthSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  if (!token) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}

export default App;
