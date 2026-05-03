from core.config import get_settings

from fastapi import FastAPI


from fastapi.middleware.cors import CORSMiddleware

from routers import health, info, flow_forge, security
from middleware.rate_limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request


cnf = get_settings()


# FastAPI Initialization
app = FastAPI(
    title=cnf.info.name,
    description=cnf.info.description,
    version=cnf.info.version,
    contact={
        "name": cnf.info.contact_name,
        "email": cnf.info.contact_email,
        "url": cnf.info.contact_url,
    },
    license_info={"name": cnf.info.license, "url": cnf.info.license_url},
    openapi_tags=[
        {"name": "Authentication", "description": "Authentication and JWT tokens"},
        {"name": "Information", "description": "Basic API Information"},
        {
            "name": "Flow Forge AI",
            "description": "API to automatically create workflows using natural language.",
        },
    ],
)

# Configure rate limiter
app.state.limiter = limiter

app.add_middleware(SlowAPIMiddleware)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cnf.cors.cors_allow_origins,
    allow_methods=cnf.cors.cors_allow_methods,
    allow_headers=cnf.cors.cors_allow_headers,
)


# Custom handler for rate limiting
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Request limit exceeded. Please try again later.",
            "path": str(request.url),
        },
        headers={"Retry-After": "60"},
    )


# Include routers
app.include_router(health.router, tags=["Information"])
app.include_router(info.router, tags=["Information"])
app.include_router(flow_forge.router, tags=["Flow Forge AI"], prefix="/v2")
app.include_router(security.router, tags=["Authentication"])
