import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db import connect_db, disconnect_db, db
from routers import cabinets, crates, items, categories, auth, audit_logs, monitoring
from qr_utils import ensure_all_qr_assets


SLOW_REQUEST_THRESHOLD_MS = 1000


def _classify_error(status_code: int) -> str:
    if status_code == 400:
        return "VALIDATION"
    if status_code in (401, 403):
        return "AUTH"
    if status_code == 404:
        return "NOT_FOUND"
    if status_code >= 500:
        return "SERVER"
    return "HTTP_ERROR"

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await ensure_all_qr_assets()
    yield
    await disconnect_db()

app = FastAPI(title="Boxfindr API (Python)", version="1.0.0", lifespan=lifespan)

# Allow requests from the Frontend (localhost:3001)
origins = [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://boxfindr.it-lab.cc:3001",
    "http://boxfindr.it-lab.cc:3000",
    "http://boxfindr.it-lab.cc:8200",
    "http://boxfindr.it-lab.cc",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):(3000|3001)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def observability_middleware(request: Request, call_next):
    started = time.perf_counter()
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    status_code = 500
    error_details = None
    response = None
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as exc:
        error_details = str(exc)
        raise
    finally:
        duration_ms = int((time.perf_counter() - started) * 1000)
        is_slow = duration_ms >= SLOW_REQUEST_THRESHOLD_MS

        try:
            await db.requestmetric.create(
                data={
                    "requestId": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "statusCode": status_code,
                    "durationMs": duration_ms,
                    "isSlow": is_slow,
                }
            )

            if status_code >= 400:
                await db.errorevent.create(
                    data={
                        "requestId": request_id,
                        "method": request.method,
                        "path": request.url.path,
                        "statusCode": status_code,
                        "errorType": _classify_error(status_code),
                        "details": error_details,
                    }
                )
        except Exception:
            # Never fail user requests because telemetry write failed.
            pass

    if response is not None:
        response.headers["x-request-id"] = request_id
        return response

    # Should be unreachable, but keep explicit fallback for type safety.
    raise RuntimeError("Request handling failed")

app.include_router(cabinets.router)
app.include_router(crates.router)
app.include_router(items.router)
app.include_router(categories.router)
app.include_router(auth.router)
app.include_router(audit_logs.router)
app.include_router(monitoring.router)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "python-backend"}


@app.get("/health/ready")
async def readiness_check():
    try:
        await db.user.count()
        return {"status": "ok", "service": "python-backend", "database": "ok"}
    except Exception:
        return {"status": "degraded", "service": "python-backend", "database": "error"}
