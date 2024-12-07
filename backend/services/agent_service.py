import logging
import uuid

import pymupdf
from PIL import Image
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from qdrant_client import models

from base.db import aclient, COLLECTION_NAME
from model import (
    GenProcessor,
    GenModel,
    generate_embedding,
    answer,
)
from pdf_reader import PdfColPaliReader
from qwen_vl_utils import process_vision_info

FILE_EXTRACTOR = {"pdf": PdfColPaliReader()}


logger = logging.getLogger(__name__)

VISUAL_DOCS_EXTS = ["pdf"]


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
            nodes = await splitter.aget_nodes_from_documents(documents=files)
            points = []
            for node in nodes:
                points.append(
                    models.PointStruct(
                        id=str(uuid.uuid4()),
                        vector=generate_embedding(node.get_content()),
                        payload=node.metadata,
                    )
                )
            await aclient.upsert(COLLECTION_NAME, points)

    async def query(self, question: str, meta: dict):
        multivector_query = generate_embedding(question)

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
