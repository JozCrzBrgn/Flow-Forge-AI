from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from schemas.security import TokenResponse
from services.security import authenticate_user, create_access_token, create_user, decode_access_token

router = APIRouter()


@router.post(
    "/token",
    response_model=TokenResponse,
    tags=["Authentication"],
    summary="Get JWT token",
    description="Generates a JWT token for user authentication.",
    responses={
        400: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {"detail": "Incorrect username or password."}
                }
            },
        }
    },
)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password.",
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.post(
    "/register",
    response_model=TokenResponse,
    tags=["Authentication"],
    summary="Register a new user",
    description="Registers a new user with the provided credentials.",
    responses={
        400: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {"detail": "Incorrect username or password."}
                }
            },
        }
    },
)
async def register(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    current_username: str = Depends(decode_access_token)
):
    if current_username != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can register new users.",
        )
    user = create_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password.",
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return TokenResponse(access_token=access_token, token_type="bearer")
