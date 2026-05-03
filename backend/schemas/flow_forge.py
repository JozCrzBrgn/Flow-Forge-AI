from pydantic import BaseModel, Field
from typing import List, Optional


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
    workflow_id: Optional[str] = None
    name: Optional[str] = None


class WorkflowUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
