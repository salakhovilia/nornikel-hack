import torch
from colpali_engine import ColQwen2, ColQwen2Processor
from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, AutoProcessor

MODEL_NAME = "vidore/colpali-v1.1"

device = "cpu"
if torch.cuda.is_available():
    device = "cuda:0"

ColPaliModel = ColQwen2.from_pretrained(
    MODEL_NAME, torch_dtype="auto", device_map=device, offload_folder=".offload"
)

ColPaliProcessor = ColQwen2Processor.from_pretrained(MODEL_NAME)

# If you have more VRAM, feel free to use more powerful models !
GenModel = Qwen2VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct", torch_dtype="auto", device_map=device
)

max_pixels = (
    448 * 28 * 28
)  # decrease resolution to fit in RAM at the cost of performance (if you have more RAM, feel free to up 512 to much higher)
GenProcessor = AutoProcessor.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct", torch_dtype="auto"
)
