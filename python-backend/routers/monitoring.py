from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from db import db
from security import decode_request_token, is_admin_request

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


class ScanEventPayload(BaseModel):
    eventType: str
    entityType: str
    entityId: Optional[int] = None
    qrPayload: Optional[str] = None
    status: str
    errorMessage: Optional[str] = None


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def _require_admin(request: Request) -> None:
    if not await is_admin_request(request):
        raise HTTPException(status_code=403, detail="Admin access required")


@router.post("/scan-events")
async def create_scan_event(payload: ScanEventPayload, request: Request):
    user_id: Optional[int] = None
    token_payload = decode_request_token(request)
    if token_payload and token_payload.get("sub") is not None:
        try:
            user_id = int(token_payload.get("sub"))
        except (TypeError, ValueError):
            user_id = None

    request_id = request.headers.get("x-request-id")

    event = await db.scanevent.create(
        data={
            "eventType": payload.eventType,
            "entityType": payload.entityType,
            "entityId": payload.entityId,
            "qrPayload": payload.qrPayload,
            "status": payload.status,
            "errorMessage": payload.errorMessage,
            "userId": user_id,
            "requestId": request_id,
        }
    )

    return {"ok": True, "id": event.id}


@router.get("/summary")
async def get_monitoring_summary(request: Request):
    await _require_admin(request)

    now = _utc_now()
    since = now - timedelta(hours=24)

    db_ok = True
    try:
        await db.user.count()
    except Exception:
        db_ok = False

    total_requests = await db.requestmetric.count(where={"timestamp": {"gte": since}})
    error_requests = await db.errorevent.count(where={"timestamp": {"gte": since}})
    slow_requests = await db.requestmetric.count(
        where={"timestamp": {"gte": since}, "isSlow": True}
    )

    durations = await db.requestmetric.find_many(
        where={"timestamp": {"gte": since}},
        take=5000,
        order={"timestamp": "desc"},
    )
    avg_duration_ms = 0
    if durations:
        avg_duration_ms = round(sum(d.durationMs for d in durations) / len(durations))

    failed_scan_count = await db.scanevent.count(
        where={"timestamp": {"gte": since}, "status": {"startsWith": "failed"}}
    )

    recent_failed_scans = await db.scanevent.find_many(
        where={"timestamp": {"gte": since}, "status": {"startsWith": "failed"}},
        order={"timestamp": "desc"},
        take=20,
    )

    recent_slow = await db.requestmetric.find_many(
        where={"timestamp": {"gte": since}, "isSlow": True},
        order={"durationMs": "desc"},
        take=100,
    )

    grouped_endpoints: dict[str, dict[str, float]] = {}
    for row in recent_slow:
        key = f"{row.method} {row.path}"
        if key not in grouped_endpoints:
            grouped_endpoints[key] = {"count": 0, "sum": 0}
        grouped_endpoints[key]["count"] += 1
        grouped_endpoints[key]["sum"] += row.durationMs

    slow_endpoints = []
    for endpoint, metrics in grouped_endpoints.items():
        count = int(metrics["count"])
        avg_ms = round(metrics["sum"] / max(count, 1))
        slow_endpoints.append({"endpoint": endpoint, "count": count, "avgDurationMs": avg_ms})

    slow_endpoints.sort(key=lambda item: item["avgDurationMs"], reverse=True)

    error_rate = 0.0
    if total_requests > 0:
        error_rate = round((error_requests / total_requests) * 100, 2)

    return {
        "windowHours": 24,
        "health": {
            "status": "ok" if db_ok else "degraded",
            "database": "ok" if db_ok else "error",
            "service": "python-backend",
        },
        "requests": {
            "total": total_requests,
            "errors": error_requests,
            "errorRatePercent": error_rate,
            "slowCount": slow_requests,
            "avgDurationMs": avg_duration_ms,
            "slowThresholdMs": 1000,
        },
        "scans": {
            "failedCount": failed_scan_count,
            "recentFailed": [
                {
                    "id": row.id,
                    "timestamp": row.timestamp.isoformat(),
                    "eventType": row.eventType,
                    "entityType": row.entityType,
                    "entityId": row.entityId,
                    "status": row.status,
                    "errorMessage": row.errorMessage,
                }
                for row in recent_failed_scans
            ],
        },
        "slowEndpoints": slow_endpoints[:10],
    }
