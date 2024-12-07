import torch
from colpali_engine import ColQwen2, ColQwen2Processor

MODEL_NAME = "vidore/colqwen2-v0.1"

device = "cpu"
if torch.cuda.is_available():
    device = "cuda:0"

ColPaliModel = ColQwen2.from_pretrained(
    MODEL_NAME, torch_dtype=torch.bfloat16, device_map=device, offload_folder=".offload"
)

ColPaliProcessor = ColQwen2Processor.from_pretrained(MODEL_NAME)
