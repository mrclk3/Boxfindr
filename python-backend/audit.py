import os
from typing import Optional

from fastapi import Request
from jose import JWTError, jwt

from db import db

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ALGORITHM = "HS256"
SYSTEM_EMAIL = "system@boxfindr.local"


async def _get_or_create_system_user_id() -> int:
    user = await db.user.find_unique(where={"email": SYSTEM_EMAIL})
    if user:
        return user.id

    created = await db.user.create(
        data={
            "email": SYSTEM_EMAIL,
            "name": "System",
            "password": "system",
            "role": "ADMIN",
        }
    )
    return created.id


async def resolve_actor_user_id(request: Request) -> int:
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        if token:
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                sub = payload.get("sub")
                if sub is not None:
                    user_id = int(sub)
                    user = await db.user.find_unique(where={"id": user_id})
                    if user:
                        return user.id
            except (JWTError, ValueError, TypeError):
                pass

    return await _get_or_create_system_user_id()


async def log_action(
    request: Request,
    action: str,
    details: str,
    item_id: Optional[int] = None,
    quantity_change: Optional[int] = None,
) -> None:
    user_id = await resolve_actor_user_id(request)
    await db.auditlog.create(
        data={
            "userId": user_id,
            "itemId": item_id,
            "action": action,
            "details": details,
            "quantityChange": quantity_change,
        }
    )
