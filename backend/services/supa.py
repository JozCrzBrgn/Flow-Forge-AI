from datetime import datetime, timezone
from supabase import create_client
from core.config import get_settings

cnf = get_settings()

supabase = create_client(
    cnf.supa.url,
    cnf.supa.key
)

def create_workflow(user_id: str, name: str):
    res = supabase.table(cnf.supa.wf_table).insert({
        "name": name or "Untitled Workflow",
        "description": "",
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).execute()
    return res.data[0]

def get_next_version_number(workflow_id: str):
    res = supabase.table(cnf.supa.wv_table) \
        .select("version_number") \
        .eq("workflow_id", workflow_id) \
        .order("version_number", desc=True) \
        .limit(1) \
        .execute()

    if res.data:
        return res.data[0]["version_number"] + 1
    return 1

def create_workflow_version(workflow_id: str, version_number: int, definition: dict):
    res = supabase.table(cnf.supa.wv_table).insert({
        "workflow_id": workflow_id,
        "version_number": version_number,
        "definition": definition,
        "created_at": datetime.now(timezone.utc).isoformat()
    }).execute()
    return res.data[0]

def update_workflow_latest_version(workflow_id: str, version_id: str):
    supabase.table(cnf.supa.wf_table).update({
        "latest_version_id": version_id,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", workflow_id).execute()

def list_workflows_by_user(user_id: str):
    res = supabase.table(cnf.supa.wf_table) \
        .select("id, name, description, updated_at, created_at") \
        .eq("user_id", user_id) \
        .order("updated_at", desc=True) \
        .execute()
    return res.data

def get_workflow_by_id(workflow_id: str, user_id: str):
    res = supabase.table(cnf.supa.wf_table) \
        .select("id, name, description, latest_version_id, updated_at") \
        .eq("id", workflow_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()
    return res.data

def get_version_by_id(version_id: str):
    res = supabase.table(cnf.supa.wv_table) \
        .select("id, version_number, definition") \
        .eq("id", version_id) \
        .single() \
        .execute()
    return res.data

def update_workflow_metadata(workflow_id: str, user_id: str, updates: dict):
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = supabase.table(cnf.supa.wf_table) \
        .update(updates) \
        .eq("id", workflow_id) \
        .eq("user_id", user_id) \
        .execute()
    return res.data[0] if res.data else None
