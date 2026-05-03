from services.flow_forge import load_system_prompt
from schemas.flow_forge import ChatRequest
from services.flow_forge import build_prompt
from services.flow_forge import call_llm_with_retry
from services.flow_forge import sanitize_workflow
from fastapi import APIRouter, Depends, Request
from services.dependencies import get_current_user
from typing import Annotated

from core.config import get_settings
from middleware.rate_limiter import limiter

cnf = get_settings()


router = APIRouter()


@router.post(
    "/chat",
    summary="Flow Forge AI Chat",
    description="Chat with Flow Forge AI.",
    tags=["Flow Forge AI"],
)
@limiter.limit(cnf.security.rate_limit)
def chat(
    request: Request,
    payload: ChatRequest,
    username: Annotated[str, Depends(get_current_user)],
):
    current = payload.workflow or {"nodes": [], "edges": []}

    system_metadata, system_content = load_system_prompt()

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": build_prompt(current, payload.message)},
    ]

    try:
        workflow = call_llm_with_retry(messages)

        cleaned = sanitize_workflow(workflow)

        return {"workflow": cleaned}

    except Exception as e:
        return {"error": str(e)}
