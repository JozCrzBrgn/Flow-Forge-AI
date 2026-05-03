import { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Flow from "./components/Flow";
import Login from "./components/Login";

export default function App() {
  const [workflow, setWorkflow] = useState({
    nodes: [],
    edges: []
  });
  
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "35%", borderRight: "1px solid #ddd" }}>
        <Chat workflow={workflow} setWorkflow={setWorkflow} token={token} onLogout={handleLogout} />
      </div>

      <div style={{ width: "65%" }}>
        <Flow workflow={workflow} />
      </div>
    </div>
  );
}