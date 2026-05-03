from pydantic import Field
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import uuid
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ===== MODELS =====


class Node(BaseModel):
    id: str
    type: str
    text: str


class Edge(BaseModel):
    from_: str = Field(alias="from")
    to: str
    condition: Optional[str] = None

    class Config:
        populate_by_name = True


class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class ChatRequest(BaseModel):
    message: str
    workflow: Optional[dict] = None


# ===== PROMPT =====

SYSTEM_PROMPT = """
You are a workflow builder AI.

You create and update workflow diagrams using JSON.

Structure:
{
    "nodes": [{"id": "...", "type": "step|decision", "text": "..."}],
    "edges": [{"from": "...", "to": "...", "condition": "..."}]
}

Rules:
- Node IDs must remain stable across generations.
- If a node is modified, keep its ID.
- If a node is deleted, remove it from edges.

Edges MUST use keys:
- "from"
- "to"
- "condition"

- Only return valid JSON
- Do not explain anything
- Maintain existing nodes unless user modifies
- Support create, update, delete
- Decisions must branch (yes/no)
- Keep IDs stable
"""


def build_prompt(current, message):
    return f"""
Current workflow:
{json.dumps(current)}

User request:
{message}

Return ONLY JSON
"""


# ===== ENDPOINT =====


@app.post("/chat")
def chat(req: ChatRequest):
    current = req.workflow or {"nodes": [], "edges": []}

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(current, req.message)},
        ],
        temperature=0,
    )

    content = response.choices[0].message.content

    try:
        parsed = json.loads(content)

        for node in parsed["nodes"]:
            if "id" not in node:
                node["id"] = str(uuid.uuid4())

        Workflow(**parsed)

        return {"workflow": parsed}

    except Exception as e:
        return {"error": str(e), "raw": content}
