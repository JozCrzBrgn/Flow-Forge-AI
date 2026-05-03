from schemas.flow_forge import Workflow
import json
from openai import OpenAI
from core.config import get_settings
from pydantic import ValidationError
import uuid


cnf = get_settings()

client = OpenAI(api_key=cnf.agent.openai_api_key)


def load_system_prompt():
    try:
        with open("prompts/system_prompt.json", "r") as f:
            metadata = json.load(f)

        with open(metadata["content_path"], "r") as f:
            content = f.read()

        return metadata, content

    except Exception as e:
        print("Error loading system prompt:", e)
        return None, None


def build_prompt(current, message):
    return f"""
Current workflow:
{json.dumps(current)}

User request:
{message}

Return ONLY JSON
"""


def call_llm_with_retry(messages, max_retries=3):
    base_messages = messages.copy()

    for i in range(max_retries):
        response = client.chat.completions.create(
            model=cnf.agent.openai_model,
            messages=base_messages,
            temperature=cnf.agent.openai_temperature,
        )

        content = response.choices[0].message.content

        try:
            parsed = json.loads(content)

            # asegurar estructura mínima
            if "nodes" not in parsed:
                parsed["nodes"] = []
            if "edges" not in parsed:
                parsed["edges"] = []

            validated = Workflow(**parsed)
            return validated.dict(by_alias=True)

        except (json.JSONDecodeError, ValidationError) as e:
            print(f"Retry {i + 1} error:", e)

            base_messages = base_messages + [
                {
                    "role": "system",
                    "content": "Return ONLY valid JSON with correct schema. No explanations.",
                }
            ]

    raise Exception("LLM failed after retries")


def sanitize_workflow(data: dict):
    """
    - Asegura IDs
    - Limpia edges inválidos
    """

    node_ids = set()
    nodes = []

    for node in data.get("nodes", []):
        nid = node.get("id") or str(uuid.uuid4())

        node_ids.add(nid)

        nodes.append(
            {"id": nid, "type": node.get("type", "step"), "text": node.get("text", "")}
        )

    edges = []

    for edge in data.get("edges", []):
        if edge.get("from") in node_ids and edge.get("to") in node_ids:
            edges.append(
                {
                    "from": edge.get("from"),
                    "to": edge.get("to"),
                    "condition": edge.get("condition"),
                }
            )

    return {"nodes": nodes, "edges": edges}
