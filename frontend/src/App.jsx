import { useState } from "react";
import Chat from "./components/Chat";
import Flow from "./components/Flow";

export default function App() {
  const [workflow, setWorkflow] = useState({
    nodes: [],
    edges: []
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "35%", borderRight: "1px solid #ddd" }}>
        <Chat workflow={workflow} setWorkflow={setWorkflow} />
      </div>

      <div style={{ width: "65%" }}>
        <Flow workflow={workflow} />
      </div>
    </div>
  );
}