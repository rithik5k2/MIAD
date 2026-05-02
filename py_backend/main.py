from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import predict
from utils.model_loader import load_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    print("[main] Both models loaded. API ready.")
    yield


app = FastAPI(
    title="Medical Image Anomaly Detection — Python Backend",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "Python inference server running", "port": 8000}

@app.get("/health")
def health():
    return {"status": "ok"}
