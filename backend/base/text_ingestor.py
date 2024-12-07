from llama_index.core.ingestion import IngestionPipeline, DocstoreStrategy
from llama_index.core.node_parser import SemanticSplitterNodeParser, SentenceSplitter

from base.db import vector_store

# splitter = SemanticSplitterNodeParser(
#     buffer_size=1, breakpoint_percentile_threshold=98, embed_model=embed_model
# )
splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=20)

TextIngestionPipeline = IngestionPipeline(
    name="TextIngestion",
    transformations=[splitter],
    vector_store=vector_store,
    docstore_strategy=DocstoreStrategy.UPSERTS,
)
