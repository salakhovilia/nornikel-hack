from typing import Any, List

from colpali_engine import ColQwen2, ColQwen2Processor
from llama_index.core.base.embeddings.base import BaseEmbedding
from pydantic import PrivateAttr


class ColPaliEmbedding(BaseEmbedding):
    _model: ColQwen2 = PrivateAttr()
    _processor: ColQwen2Processor = PrivateAttr()

    def __init__(
        self,
        model,
        processor,
        **kwargs: Any,
    ) -> None:
        super().__init__(**kwargs)

        self._model = model
        self._processor = processor

    @classmethod
    def class_name(cls) -> str:
        return "colpali"

    async def _aget_query_embedding(self, query: str) -> List[List[float]]:
        return self._get_query_embedding(query)

    async def _aget_text_embedding(self, text: str) -> List[List[float]]:
        return self._get_text_embedding(text)

    def _get_query_embedding(self, query: str) -> List[List[float]]:
        processed_query = self._processor.process_queries([query]).to(
            self._model.device
        )
        embeddings = self._model(**processed_query)

        return embeddings.to(self._model.device).float().numpy()[0].tolist()

    def _get_text_embedding(self, text: str) -> List[List[float]]:
        processed_query = self._processor.process_queries([text]).to(self._model.device)

        embeddings = self._model(**processed_query)

        return embeddings.to(self._model.device).float().numpy()[0].tolist()

    def _get_text_embeddings(self, texts: List[str]) -> List[List[List[float]]]:
        processed_queries = self._processor.process_queries(texts)
        batch_query = {
            k: v.to(self._model.device) for k, v in processed_queries.items()
        }

        embeddings_query = self._model(**batch_query)

        return embeddings_query.float().numpy().tolist()
