import logging
from pathlib import Path
from typing import List, Optional, Dict

import pymupdf
import torch
from PIL import Image
from fsspec import AbstractFileSystem
from llama_index.core import Document
from llama_index.core.readers.base import BaseReader
from starlette.concurrency import run_in_threadpool

from model import ColPaliProcessor, ColPaliModel, answer

logger = logging.getLogger(__name__)


class PdfColPaliReader(BaseReader):
    supported_files = ["pdf"]

    def __init__(self):
        super().__init__()

    async def aload_data(
        self,
        file_path: Path,
        extra_info: Optional[Dict] = None,
        fs: Optional[AbstractFileSystem] = None,
    ) -> List[Document]:
        extension = Path(file_path).name.split(".")[-1]
        if extension not in self.supported_files:
            logger.warning(f"Unsupported file type: {extension}")
            return []

        # check if file_path is a string or Path
        if not isinstance(file_path, str) and not isinstance(file_path, Path):
            raise TypeError("file_path must be a string or Path.")

        # open PDF file
        doc = pymupdf.open(file_path)

        # if extra_info is not None, check if it is a dictionary
        if extra_info:
            if not isinstance(extra_info, dict):
                raise TypeError("extra_info must be a dictionary.")

        if not extra_info:
            extra_info = {}
        extra_info["total_pages"] = len(doc)
        extra_info["file_path"] = str(file_path)

        docs = []
        for page in doc:
            pix: pymupdf.Pixmap = page.get_pixmap()

            print(page, (pix.width, pix.height))

            image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            image = image.resize((448, 448))
            processed_img = ColPaliProcessor.process_images([image]).to(
                ColPaliModel.device
            )

            with torch.no_grad():
                embeddings = await run_in_threadpool(ColPaliModel, **processed_img)
                embeddings_list = list(embeddings.cpu().float().numpy()[0].tolist())

            # text = answer(
            #     [
            #         {
            #             "role": "user",
            #             "content": [
            #                 {
            #                     "type": "image",
            #                     "image": image,
            #                 },
            #                 {
            #                     "type": "text",
            #                     "text": f"Describe what is in the provided image and consider and rely on the text extracted from the image. \n\nExtracted text: {page.get_text()}",
            #                 },
            #             ],
            #         }
            #     ]
            # )

            docs.append(
                {
                    "text": page.get_text(),
                    "embedding": embeddings_list,
                    "extra_info": dict(
                        extra_info,
                        **{
                            "source": f"{page.number + 1}",
                        },
                    ),
                }
            )

        return docs
