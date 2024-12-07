import os
import sys

from llama_index.core import VectorStoreIndex
from llama_index.vector_stores.postgres import PGVectorStore
from psycopg_pool import AsyncConnectionPool
from sqlalchemy import make_url

from embedding import ColPaliEmbedding
from model import ColPaliModel, ColPaliProcessor

url = make_url(os.environ.get("DOCUMENT_DATABASE_URL"))


def reconnect_failed():
    sys.exit(1)


pool = AsyncConnectionPool(
    os.environ.get("DOCUMENT_DATABASE_URL"),
    open=False,
    reconnect_failed=reconnect_failed,
)

vector_store = PGVectorStore.from_params(
    database=url.database,
    host=url.host,
    password=url.password,
    port=url.port,
    user=url.username,
    table_name="documents",
    embed_dim=3456,
)


index = VectorStoreIndex.from_vector_store(
    vector_store=vector_store,
    embed_model=ColPaliEmbedding(ColPaliModel, ColPaliProcessor),
)

query_engine = index.as_query_engine()
