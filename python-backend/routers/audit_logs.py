from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query
from fastapi.encoders import jsonable_encoder

from db import db

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("")
async def get_audit_logs(
    userId: Optional[int] = Query(default=None),
    action: Optional[str] = Query(default=None),
    startDate: Optional[str] = Query(default=None),
    endDate: Optional[str] = Query(default=None),
):
    where = {}

    if userId is not None:
        where["userId"] = userId

    if action:
        where["action"] = action

    if startDate or endDate:
        timestamp_filter = {}
        if startDate:
            timestamp_filter["gte"] = datetime.fromisoformat(startDate.replace("Z", "+00:00"))
        if endDate:
            timestamp_filter["lte"] = datetime.fromisoformat(endDate.replace("Z", "+00:00"))
        where["timestamp"] = timestamp_filter

    logs = await db.auditlog.find_many(
        where=where,
        include={"user": True, "item": True},
        order={"timestamp": "desc"},
    )

    encoded_logs = jsonable_encoder(logs)
    for log in encoded_logs:
        user = log.get("user")
        if user:
            user.pop("password", None)

    return encoded_logs
