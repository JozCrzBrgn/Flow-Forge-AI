import { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Flow from "./components/Flow";
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const [workflow, setWorkflow] = useState({
    nodes: [],
    edges: []
  });
  
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [view, setView] = useState("app");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username || "");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
  }, [token, username]);

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    setView("app");
  };

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
    setWorkflow({ nodes: [], edges: [] });
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (view === "register" && username === "admin") {
    return <Register token={token} onBack={() => setView("app")} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "35%", borderRight: "1px solid #ddd" }}>
        <Chat workflow={workflow} setWorkflow={setWorkflow} token={token} username={username} onLogout={handleLogout} onGoRegister={() => setView("register")} />
      </div>

      <div style={{ width: "65%" }}>
        <Flow workflow={workflow} />
      </div>
    </div>
  );
}