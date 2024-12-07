import torch
from colpali_engine import ColQwen2, ColQwen2Processor

MODEL_NAME = "vidore/colqwen2-v0.1"

ColPaliModel = ColQwen2.from_pretrained(
    MODEL_NAME, torch_dtype=torch.bfloat16, device_map="cpu", offload_folder=".offload"
)

ColPaliProcessor = ColQwen2Processor.from_pretrained(MODEL_NAME)
