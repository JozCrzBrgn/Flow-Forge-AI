from services.flow_forge import load_system_prompt
from schemas.flow_forge import ChatRequest
from services.flow_forge import build_prompt
from services.flow_forge import call_llm_with_retry
from services.flow_forge import sanitize_workflow
from fastapi import APIRouter

router = APIRouter()


@router.post(
    "/chat",
    summary="Flow Forge AI Chat",
    description="Chat with Flow Forge AI.",
    tags=["Flow Forge AI"],
)
def chat(req: ChatRequest):
    current = req.workflow or {"nodes": [], "edges": []}

    system_metadata, system_content = load_system_prompt()

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": build_prompt(current, req.message)},
    ]

    try:
        workflow = call_llm_with_retry(messages)

        cleaned = sanitize_workflow(workflow)

        return {"workflow": cleaned}

    except Exception as e:
        return {"error": str(e)}
