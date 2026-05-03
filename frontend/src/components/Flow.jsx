import ReactFlow, { Background, Controls } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

const nodeWidth = 180;
const nodeHeight = 60;

const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
        rankdir: "TB",
        nodesep: 50,
        ranksep: 100,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
        const pos = dagreGraph.node(node.id);

        return {
            ...node,
            position: {
                x: pos.x - nodeWidth / 2,
                y: pos.y - nodeHeight / 2,
            },
        };
    });
};

export default function Flow({ workflow }) {
    let nodes = workflow.nodes.map((n) => ({
        id: n.id,
        data: { label: n.text },
        position: { x: 0, y: 0 }, // dagre lo calcula
        style: {
            padding: 10,
            borderRadius: n.type === "decision" ? 0 : 8,
            background: n.type === "decision" ? "#ffeeba" : "#d1ecf1",
            border: "1px solid #999",
        },
    }));

    let edges = workflow.edges.map((e, i) => ({
        id: `${e.from}-${e.to}-${i}`,
        source: e.from,
        target: e.to,
        label: e.condition || "",
        animated: true,
    }));

    nodes = getLayoutedElements(nodes, edges);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}