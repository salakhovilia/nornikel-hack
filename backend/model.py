from typing import List

import torch
from colpali_engine import ColQwen2, ColQwen2Processor, ColPali, ColPaliProcessor
from qwen_vl_utils import process_vision_info
from starlette.concurrency import run_in_threadpool
from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, AutoProcessor


MODEL_NAME = "vidore/colpali-v1.1"

device = "cpu"
if torch.cuda.is_available():
    device = "cuda:0"

ColPaliModel = ColPali.from_pretrained(
    MODEL_NAME, torch_dtype="auto", device_map=device, offload_folder=".offload"
)

ColPaliProcessor = ColPaliProcessor.from_pretrained(MODEL_NAME)

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


async def generate_embedding(text: str) -> List[List[float]]:
    processed_query = ColPaliProcessor.process_queries([text]).to(ColPaliModel.device)

    embeddings = await run_in_threadpool(ColPaliModel, **processed_query)

    return embeddings.cpu().float().numpy()[0].tolist()


def answer(messages):
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

    with torch.no_grad():
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

    return output_text
