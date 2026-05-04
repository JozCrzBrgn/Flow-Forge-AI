from core.config import get_settings
from fastapi import APIRouter, Depends, HTTPException, Request
from middleware.rate_limiter import limiter
from schemas.flow_forge import ChatRequest, WorkflowUpdateRequest
from services import supa as supa_service
from services.dependencies import get_current_user
from services.flow_forge import (
    build_prompt,
    call_llm_with_retry,
    load_system_prompt,
    sanitize_workflow,
)

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
    user=Depends(get_current_user),
):
    try:
        # Get current workflow
        current = payload.workflow or {"nodes": [], "edges": []}

        # Load system prompt
        system_metadata, system_content = load_system_prompt()

        # Build prompt
        messages = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": build_prompt(current, payload.message)},
        ]

        # Call LLM to get the new workflow definition
        workflow = call_llm_with_retry(messages)

        # Sanitize the workflow
        cleaned = sanitize_workflow(workflow)

        # Create or use workflow
        if payload.workflow_id:
            workflow_id = payload.workflow_id
        else:
            wf = supa_service.create_workflow(user["sub"], payload.name)
            workflow_id = wf["id"]

        # Get the next version number
        next_version = supa_service.get_next_version_number(workflow_id)

        # Insert the new version
        v_res = supa_service.create_workflow_version(workflow_id, next_version, cleaned)
        version_id = v_res["id"]

        # Update the latest version
        supa_service.update_workflow_latest_version(workflow_id, version_id)

        # Return the new workflow
        return {
            "workflow": cleaned,
            "workflow_id": workflow_id,
            "version_id": version_id,
            "version_number": next_version
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/workflows",
    summary="List user workflows",
    description="Returns all workflows owned by the authenticated user.",
    tags=["Flow Forge AI"],
)
def list_workflows(
    request: Request,
    user=Depends(get_current_user),
):
    try:
        workflows = supa_service.list_workflows_by_user(user["sub"])
        return {"workflows": workflows}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/workflows/{workflow_id}",
    summary="Load a workflow",
    description="Returns a workflow with its latest version definition.",
    tags=["Flow Forge AI"],
)
def get_workflow(
    workflow_id: str,
    request: Request,
    user=Depends(get_current_user),
):
    try:
        # Verify ownership
        wf = supa_service.get_workflow_by_id(workflow_id, user["sub"])
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found.")

        # Load latest version definition
        version = None
        version_number = None
        if wf.get("latest_version_id"):
            v_data = supa_service.get_version_by_id(wf["latest_version_id"])
            if v_data:
                version = v_data["definition"]
                version_number = v_data["version_number"]

        return {
            "workflow_id": wf["id"],
            "name": wf["name"],
            "description": wf.get("description", ""),
            "version_number": version_number,
            "workflow": version,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch(
    "/workflows/{workflow_id}",
    summary="Update workflow metadata",
    description="Updates the name and/or description of an existing workflow.",
    tags=["Flow Forge AI"],
)
def update_workflow(
    workflow_id: str,
    payload: WorkflowUpdateRequest,
    request: Request,
    user=Depends(get_current_user),
):
    try:
        # Build only the fields that were provided
        updates = {}
        if payload.name is not None:
            updates["name"] = payload.name
        if payload.description is not None:
            updates["description"] = payload.description

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update.")

        updated = supa_service.update_workflow_metadata(workflow_id, user["sub"], updates)

        if not updated:
            raise HTTPException(status_code=404, detail="Workflow not found.")

        return {
            "workflow_id": updated["id"],
            "name": updated["name"],
            "description": updated.get("description", ""),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
