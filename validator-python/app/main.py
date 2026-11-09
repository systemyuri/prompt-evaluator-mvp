import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import aggregator
from app.models import BuilderRequest, FreeRequest, ValidationResponse

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(title="Prompt Evaluator — Validator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ajustar en producción
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "validator-python"}


@app.post("/validate/builder", response_model=ValidationResponse)
def validate_builder(req: BuilderRequest):
    try:
        return aggregator.validate_builder(req)
    except Exception as e:
        logger.exception("Error en /validate/builder")
        raise HTTPException(status_code=422, detail=str(e)) from e


@app.post("/validate/free", response_model=ValidationResponse)
def validate_free(req: FreeRequest):
    try:
        return aggregator.validate_free(req)
    except Exception as e:
        logger.exception("Error en /validate/free")
        raise HTTPException(status_code=422, detail=str(e)) from e
