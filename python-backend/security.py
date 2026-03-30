import os
from typing import Optional

from fastapi import Request
from jose import JWTError, jwt

from db import db

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ALGORITHM = "HS256"


def _extract_bearer_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    return token or None


def decode_request_token(request: Request) -> Optional[dict]:
    token = _extract_bearer_token(request)
    if not token:
        return None

    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


async def is_admin_request(request: Request) -> bool:
    payload = decode_request_token(request)
    if not payload:
        return False

    sub = payload.get("sub")
    role = str(payload.get("role", "")).upper()
    if sub is None:
        return role == "ADMIN"

    try:
        user_id = int(sub)
    except (ValueError, TypeError):
        return role == "ADMIN"

    user = await db.user.find_unique(where={"id": user_id})
    if user and str(user.role).upper().endswith("ADMIN"):
        return True

    return role == "ADMIN"
