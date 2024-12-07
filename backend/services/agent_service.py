import base64
import logging
import uuid
from io import BytesIO

import pymupdf
from PIL import Image
from llama_index.core import SimpleDirectoryReader, Document
from qdrant_client import models

from base.db import aclient, COLLECTION_NAME, vector_store, index
from base.text_ingestor import TextIngestionPipeline
from model import ColPaliProcessor, ColPaliModel, GenProcessor, GenModel
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

        path = search_result.points[0].payload["file_path"]
        index = int(search_result.points[0].payload["source"]) - 1

        pdf = pymupdf.open(path)
        page = pdf.load_page(index)
        pix = page.get_pixmap()

        image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        image = image.resize((448, 448))

        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue())
        img_bytes = f"data:image/jpeg;base64,{img_str}"

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "image": image,
                    },
                    {"type": "text", "text": search_result.points[0].payload["text"]},
                    {
                        "type": "text",
                        "text": f"Answer the question using the images provided, which may contain the answer.\n\nQuestion: {question}",
                    },
                ],
            }
        ]
        text = GenProcessor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )

        image_inputs, video_inputs = process_vision_info(messages)
        inputs = GenProcessor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
        )
        inputs = inputs.to(GenModel.device)

        generated_ids = GenModel.generate(**inputs, max_new_tokens=50)
        generated_ids_trimmed = [
            out_ids[len(in_ids) :]
            for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = GenProcessor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )

        return {
            "sources": search_result.points,
            "answer": output_text[0],
        }
