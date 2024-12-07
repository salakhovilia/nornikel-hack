import qdrant_client
from llama_index.core import VectorStoreIndex
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client.http import models

from model import ColPaliModel, ColPaliProcessor


aclient = qdrant_client.AsyncQdrantClient(
    host="localhost",
    port=6333,
)

client = qdrant_client.QdrantClient(
    host="localhost",
    port=6333,
)

COLLECTION_NAME = "documents"

vector_store = QdrantVectorStore(
    client=client,
    aclient=aclient,
    collection_name=COLLECTION_NAME,
    dense_config=models.VectorParams(
        size=128,
        distance=models.Distance.COSINE,
        on_disk=True,  # move original vectors to disk
        multivector_config=models.MultiVectorConfig(
            comparator=models.MultiVectorComparator.MAX_SIM
        ),
        quantization_config=models.BinaryQuantization(
            binary=models.BinaryQuantizationConfig(
                always_ram=True  # keep only quantized vectors in RAM
            ),
        ),
    ),
    quantization_config=models.BinaryQuantization(
        binary=models.BinaryQuantizationConfig(
            always_ram=True  # keep only quantized vectors in RAM
        ),
    ),
)

# index = VectorStoreIndex.from_vector_store(
#     vector_store=vector_store,
# )
