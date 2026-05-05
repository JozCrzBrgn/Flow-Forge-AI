from typing import List, Optional

from pydantic import BaseModel, Field


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


class ConversationMessage(BaseModel):
    """A single turn in the chat conversation to be persisted."""
    role: str  # 'user' | 'assistant'
    content: str
    timestamp: Optional[str] = None  # ISO-8601 string, optional


class ChatRequest(BaseModel):
    message: str
    workflow: Optional[dict] = None
    workflow_id: Optional[str] = None
    name: Optional[str] = None
    conversation: Optional[List[ConversationMessage]] = None  # full history to persist


class WorkflowUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
