import logging
import uuid

from llama_index.core import SimpleDirectoryReader, Document
from qdrant_client import models

from base.db import aclient, COLLECTION_NAME, vector_store, index
from base.text_ingestor import TextIngestionPipeline
from model import ColPaliProcessor, ColPaliModel
from pdf_reader import PdfColPaliReader

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
                        # vector=[
                        #     {
                        #         # SPARSE_VECTOR_NAME: SparseVector(
                        #         #     indices=sparse_indices[0],
                        #         #     values=sparse_vectors[0],
                        #         # ),
                        #         DENSE_VECTOR_NAME: doc["embedding"],
                        #     },
                        # ],
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

            await TextIngestionPipeline.arun(documents=files)

    async def query(self, question: str, meta: dict):
        batch_query = ColPaliProcessor.process_queries([question]).to(
            ColPaliModel.device
        )
        query_embedding = ColPaliModel(**batch_query)

        multivector_query = query_embedding.cpu().float().numpy()[0].tolist()
        search_result = await aclient.query_points(
            collection_name=COLLECTION_NAME,
            query=multivector_query,
            limit=10,
            timeout=100,
            search_params=models.SearchParams(
                quantization=models.QuantizationSearchParams(
                    ignore=False,
                    rescore=True,
                    oversampling=2.0,
                )
            ),
        )

        return {
            "sources": search_result.points,
            "answer": "",
        }
