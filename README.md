# Flow Forge AI

![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS%204-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

> Visual AI Orchestration Platform — Transform natural language into structured, automated workflows with a real-time visual nodes editor, secured by modern authentication and enterprise-grade rate limiting.

Built to demonstrate end-to-end engineering excellence: complex UI state management with React Flow, stateful AI persistence with Supabase, JWT-authenticated REST API, and containerized deployment workflows.

---

## Overview

Flow Forge AI solves the complexity of manual workflow design by allowing users to "talk" to their processes. Using **OpenAI GPT models**, the platform translates natural language descriptions into executable node-based diagrams. Users can visually refine these flows in real-time, with every iteration persisted to **Supabase** for auditing and version control.

The system is designed for reliability and security, featuring a robust Pydantic validation layer to ensure LLM outputs strictly adhere to the expected schema, and a multi-layered security approach for user data and API access.

The platform consists of three main components:

| Service | Technology | Port |
|---|---|---|
| REST API | FastAPI + Uvicorn (Python 3.12) | `8000` |
| Web UI | React 19 + Vite (Tailwind CSS 4) | `5173` |
| Database | Supabase (PostgreSQL + Auth) | Cloud / Managed |

---

## Key Features

| | Feature | Highlight |
|---|---|---|
| 🤖 | **AI Workflow Generation** | Transforms text prompts into complex, structured node-based workflows via GPT-4o |
| 🔄 | **Visual Flow Editor** | Real-time visual manipulation of nodes and edges built with React Flow |
| 💬 | **Iterative Orchestration** | Refine and expand workflows through a modern, persistent chat interface |
| 🗄️ | **Stateful Persistence** | Complete workflow versioning and history tracking powered by Supabase |
| 🔐 | **JWT + Argon2 Auth** | Secure authentication system using short-lived tokens and Argon2-cffi hashing |
| 🚧 | **Rate Limiting** | Throttling via SlowAPI to prevent API abuse and ensure service availability |
| 🎨 | **Premium Dark UI** | Sleek, responsive interface built with React 19 and Tailwind CSS 4 |
| 🐳 | **Docker Compose** | One-command orchestration with multi-stage builds and dependency ordering |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                      User Browser                       │
└───────────────────────────┬─────────────────────────────┘
                            │ :5173 (Vite / Nginx)
              ┌─────────────▼─────────────┐
              │     React 19 Frontend     │
              │  Flow Editor · Chat · Auth│
              └─────────────┬─────────────┘
                            │ REST :8000
┌───────────────────────────▼─────────────────────────────┐
│                    FastAPI Backend                      │
│ JWT Auth · CORS · Rate Limiter · Pydantic Validation    │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
   ┌───────────▼──────────┐      ┌────────▼────────┐
   │   Flow Forge Service │      │    Supabase     │
   │   (Prompt Logic)     │      │ (PostgreSQL/Auth)│
   └───────────┬──────────┘      └─────────────────┘
               │
   ┌───────────▼──────────┐
   │     OpenAI API       │
   │ (GPT-4o / GPT-4)     │
   └──────────────────────┘
```

**Request flow:** JWT auth → rate limit check → **Natural Language Parsing** → OpenAI prompt construction → LLM execution → **Pydantic Validation & Sanitization** (ID generation → edge validation → schema enforcement) → Supabase persist → Structured JSON response for React Flow.

---

## Tech Stack

**Application**

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, Uvicorn |
| Frontend | React 19, Vite, React Flow, Tailwind CSS 4 |
| AI / LLM | OpenAI API — `gpt-4o`, `gpt-4-turbo` |
| Database | Supabase (PostgreSQL), `supabase-py` client |
| Auth | JWT (python-jose), Argon2 (passlib) |
| Config | pydantic-settings (typed settings, startup validation) |
| Icons | Lucide React |

**DevOps & Quality**

| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Multi-stage builds (frontend), health checks, network isolation |
| Ruff | Ultra-fast Python linting and code formatting |
| SlowAPI | FastAPI rate limiting and brute-force protection |
| Pydantic v2 | Strict data validation and settings management |

---

## Security & Reliability

| Control | Implementation |
|---|---|
| **Argon2 Hashing** | Uses the PHC-winning Argon2-cffi algorithm for secure password storage |
| **JWT Validation** | Short-lived tokens with HS256/HS512 signatures and secret enforcement |
| **Rate Limiting** | Per-endpoint and per-user throttling via SlowAPI |
| **Schema Integrity** | Pydantic v2 models validate every incoming and outgoing LLM payload |
| **Sanitization Layer** | `sanitize_workflow` service cleans LLM outputs, ensures unique IDs, and removes invalid edges |
| **Safe SQL** | Parameterized queries handled via Supabase client to prevent SQL injection |
| **Multi-stage Docker** | Stripped production builds for the frontend to reduce attack surface |

---

## Installation & Setup

**Requirements:** Docker, Docker Compose, OpenAI API Key, Supabase Project.

```bash
# Clone the repository
git clone https://github.com/JozCrzBrgn/Flow-Forge-AI.git
cd Flow-Forge-AI

# Setup Backend Environment
cp backend/.env.example backend/.env   # Fill in OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY, etc.

# Setup Frontend Environment
cp frontend/.env.example frontend/.env # Fill in VITE_API_URL

# Launch with Docker
docker compose up --build
```

| Service | URL |
|---|---|
| Web UI | http://localhost:80 (Production) / http://localhost:5173 (Dev) |
| API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## Usage

### 1. Authenticate
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -d "username=admin&password=your_password" | jq -r .access_token)
```

### 2. Generate a Workflow
```bash
curl -X POST http://localhost:8000/v2/flows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a workflow for a customer refund process including approval steps.",
    "current_workflow": {"nodes": [], "edges": []}
  }'
```

---

## Project Highlights

| Aspect | What it demonstrates |
|---|---|
| **Complex UI Logic** | Managing graph state, visual node connections, and real-time updates in React |
| **AI Orchestration** | Designing effective prompts to force structured JSON outputs from LLMs |
| **System Resilience** | Handling LLM non-determinism with retry logic and strict schema validation |
| **Security Maturity** | Implementing modern password hashing, JWTs, and API rate limiting |
| **Clean Architecture** | Decoupling routers from service logic and using typed settings for configuration |

---

## Roadmap

- **Dynamic Node Types**: Support for custom React Flow components based on AI intent
- **Export Formats**: Export workflows to Mermaid.js, JSON, or PDF
- **Collaborative Editing**: Real-time multi-user editing via Supabase Realtime
- **Observability**: Logging and tracing for LLM calls and API performance

---

## Author

**Josue Cruz** — Backend & AI Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-josuecruzbarragan-0077B5?logo=linkedin)](https://www.linkedin.com/in/josuecruzbarragan/)
[![GitHub](https://img.shields.io/badge/GitHub-JozCrzBrgn-181717?logo=github)](https://github.com/JozCrzBrgn)

*Building resilient, modern, and highly-scalable architectural solutions heavily fortified by advanced AI workflows.*  
*Licensed under the [MIT License](LICENSE).*
