from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db import connect_db, disconnect_db
from routers import cabinets, crates, items

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()

app = FastAPI(title="Boxfindr API (Python)", version="1.0.0", lifespan=lifespan)

# Allow requests from the Frontend (localhost:3001)
origins = [
    "http://localhost:3001",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cabinets.router)
app.include_router(crates.router)
app.include_router(items.router)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "python-backend"}
