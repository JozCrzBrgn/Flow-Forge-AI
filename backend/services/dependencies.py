from fastapi import Depends, Request

from .security import decode_access_token


def get_current_user(
    request: Request, payload: dict = Depends(decode_access_token)
) -> dict:
    """
    Dependency to obtain the currently authenticated user.
    Returns the full JWT payload so callers can access any claim (e.g. payload["sub"]).
    """

    # guardar usuario en request.state para rate limiter
    request.state.user = payload.get("sub")

    return payload
