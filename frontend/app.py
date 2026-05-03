import flet as ft
import requests

API_URL = "http://localhost:8000/chat"

workflow = {"nodes": [], "edges": []}


def main(page: ft.Page):
    page.title = "AI Workflow Builder"

    chat = ft.Column()
    diagram = ft.Text("Diagram will appear here")

    input_box = ft.TextField(expand=True)

    def send_message(e):
        global workflow

        user_msg = input_box.value
        input_box.value = ""

        chat.controls.append(ft.Text(f"You: {user_msg}"))

        res = requests.post(
            API_URL, json={"message": user_msg, "workflow": workflow}
        ).json()

        if "workflow" in res:
            workflow = res["workflow"]
            chat.controls.append(ft.Text("AI updated workflow"))

            diagram.value = render_mermaid(workflow)

        else:
            chat.controls.append(ft.Text(f"Error: {res}"))

        page.update()

    send_btn = ft.ElevatedButton("Send", on_click=send_message)

    page.add(
        ft.Row(
            [
                ft.Column([chat, input_box, send_btn], expand=1),
                ft.Column([diagram], expand=1),
            ]
        )
    )


def render_mermaid(wf):
    lines = ["flowchart TD"]

    for node in wf["nodes"]:
        shape = f"[{node['text']}]" if node["type"] == "step" else f"{{{node['text']}}}"
        lines.append(f"{node['id']}{shape}")

    for edge in wf["edges"]:
        label = f"|{edge.get('condition', '')}|" if edge.get("condition") else ""
        lines.append(f"{edge['from']} -->{label} {edge['to']}")

    return "\n".join(lines)


ft.run(
    main=main,
    view=ft.AppView.WEB_BROWSER,
    port=8550,
)
