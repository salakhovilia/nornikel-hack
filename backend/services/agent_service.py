import logging
import uuid

import aiofiles.os
import pymupdf
from PIL import Image
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from qdrant_client import models

from base.db import aclient, COLLECTION_NAME
from model import (
    generate_embedding,
    answer,
)
from pdf_reader import PdfColPaliReader

FILE_EXTRACTOR = {"pdf": PdfColPaliReader()}


logger = logging.getLogger(__name__)

VISUAL_DOCS_EXTS = ["pdf"]


def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx : min(ndx + n, l)]


class AgentService:

    async def process_file(self, id, file_path, meta: dict):
        extension = "." + file_path.split(".")[-1]

        supported_files = SimpleDirectoryReader.supported_suffix_fn()
        if extension not in supported_files:
            logger.warning(f"Extension {extension} is not supported")
            return

        extension = file_path.split(".")[-1]

        if extension in FILE_EXTRACTOR:
            docs = await FILE_EXTRACTOR[extension].aload_data(file_path)

            points = []
            for i, doc in enumerate(docs):
                points.append(
                    models.PointStruct(
                        id=str(uuid.uuid4()),
                        vector=doc["embedding"],
                        payload={**doc["extra_info"], "text": doc["text"], "docId": id},
                    )
                )

            await aclient.upsert(
                COLLECTION_NAME,
                points=points,
            ),
        else:
            reader = SimpleDirectoryReader(input_files=[file_path])
            files = await reader.aload_data(show_progress=True)

            for file in files:
                file.embedding = []

            splitter = SentenceSplitter()
            nodes = await splitter.aget_nodes_from_documents(
                documents=files, show_progress=True
            )

            for batch_nodes in batch(nodes, 5):
                points = []

                for node in batch_nodes:
                    points.append(
                        models.PointStruct(
                            id=str(uuid.uuid4()),
                            vector=await generate_embedding(node.get_content()),
                            payload={**node.metadata},
                        )
                    )
                await aclient.upsert(COLLECTION_NAME, points=points)

    async def query(self, question: str, meta: dict):
        multivector_query = await generate_embedding(question)

        search_result = await aclient.query_points(
            collection_name=COLLECTION_NAME,
            query=multivector_query,
            limit=7,
            timeout=100,
            search_params=models.SearchParams(
                quantization=models.QuantizationSearchParams(
                    ignore=False,
                    rescore=True,
                    oversampling=2.0,
                )
            ),
        )

        image = None
        if len(search_result.points):
            path = search_result.points[0].payload["file_path"]
            index = int(search_result.points[0].payload["source"]) - 1

            pdf = pymupdf.open(path)
            page = pdf.load_page(index)
            pix = page.get_pixmap()

            image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            image = image.resize((448, 448))

        text = ""
        for p in search_result.points:
            text += p.payload["text"]
            text += "\n"

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "image": image,
                    },
                    {"type": "text", "text": text},
                    {
                        "type": "text",
                        "text": f"Answer the question using the documents provided, which may contain the answer. answer in the language of the question asked. \n\nQuestion: {question}",
                    },
                ],
            }
        ]

        output_text = answer(messages)

        return {
            "sources": search_result.points,
            "answer": output_text[0],
        }

    async def reindex(self):
        files_paths = await aiofiles.os.listdir("uploads")

        for i in range(len(files_paths)):
            files_paths[i] = (
                files_paths[i],
                await aiofiles.os.path.getsize(f"uploads/{files_paths[i]}"),
            )

        files_paths.sort(key=lambda filename: filename[1])

        for ind, file in enumerate(files_paths):
            logger.info(f"Processing {file[0]}")

            try:
                await self.process_file(str(uuid.uuid4()), f"uploads/{file[0]}", {})
            except Exception as e:
                logger.error(e)

            logger.info(f"Processed {ind + 1}/{len(files_paths)}")
