import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from pydantic import BaseModel
from starlette.requests import Request
from starlette.staticfiles import StaticFiles

from base.db import vector_store, COLLECTION_NAME

load_dotenv()

import json
import logging
import mimetypes
import uuid
from typing import Annotated

from llama_index.core import Settings

Settings.embed_model = None
Settings.llm = None

import aiofiles
import uvicorn

from fastapi import FastAPI, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from services.agent_service import AgentService


@asynccontextmanager
async def lifespan(app: FastAPI):
    await vector_store._acreate_collection(COLLECTION_NAME, 128)
    yield


app = FastAPI(root_path="/api", docs_url="/docs", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

logger = logging.getLogger(__name__)

agentService = AgentService()


class QueryRequest(BaseModel):
    question: str
    meta: dict


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.post("/query")
async def query(request: Request, query: QueryRequest):
    result = await agentService.query(query.question, query.meta)

    return result


@app.post("/reindex")
async def reindex(request: Request):
    result = await agentService.reindex()

    return result


@app.post("/files")
async def add_file(
    file: UploadFile, meta: Annotated[str, Form()], background_tasks: BackgroundTasks
):
    extension = mimetypes.guess_extension(file.content_type)

    if not extension:
        logger.warning(f"Extension {extension} is not supported")
        return

    id = str(uuid.uuid4())
    file_path = f"uploads/{id}_{file.filename}"
    async with aiofiles.open(file_path, "wb") as f:
        while content := await file.read(1000000):
            await f.write(content)
        await f.flush()

    meta = json.loads(meta)

    await agentService.process_file(id, file_path, meta)

    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
