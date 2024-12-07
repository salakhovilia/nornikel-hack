import logging
from typing import List, Any

from llama_index.core import SimpleDirectoryReader, Settings
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.query_pipeline import InputComponent, QueryPipeline

from llama_index.core.types import BaseModel

from pydantic.v1 import Field

from base.db import index
from base.text_ingestor import TextIngestionPipeline
from pdf_reader import PdfColPaliReader

FILE_EXTRACTOR = {"pdf": PdfColPaliReader()}


class Query(BaseModel):
    """Data model for an answer."""

    score: int = Field(description="the score from 1 to 10 CoWorker was mentioned")
    relevance: int = Field(
        description="the score from 1 to 10 the correctness, useful and relevance of the answer"
    )
    message: str


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

            for doc in docs:
                index.insert(doc)

        else:
            reader = SimpleDirectoryReader(input_files=[file_path])
            files = await reader.aload_data(show_progress=True)

            await TextIngestionPipeline.arun(documents=files)

    async def query(self, question: str, meta: dict):
        # llm = OpenAI(model="gpt-4o", temperature=0.5)
        #
        # filters = MetadataFilters(
        #     filters=[
        #         MetadataFilter(key="companyId", value=companyId, operator="=="),
        #         MetadataFilter(key="role", value="assistant", operator="!="),
        #     ],
        # )

        retriever = index.as_retriever(similarity_top_k=10)
        # messages = await self.get_last_messages(companyId, meta.get("chatId"), 25)

        # p = QueryPipeline(verbose=True)
        # p.add_modules(
        #     {
        #         "input": InputComponent(),
        #         "retriever": retriever,
        #         # "post_processor": SimilarityPostprocessor(similarity_cutoff=0.75),
        #         # "response": ResponseWithChatHistory(
        #         #     llm=llm,
        #         #     system_prompt=SYSTEM_PROMPT,
        #         #     context_prompt=USER_QUERY_PROMPT,
        #         # ),
        #     }
        # )
        # p.add_link("input", "retriever", src_key="query_str")
        # p.add_link("retriever", "post_processor", dest_key="nodes")
        # p.add_link("post_processor", "response", dest_key="nodes")
        # p.add_link("input", "response", src_key="query_str", dest_key="query_str")
        # p.add_link("input", "response", src_key="chat_history", dest_key="chat_history")

        # response = await p.arun(
        #     query_str=await self.format_query(question, meta),
        #     # chat_history=await self.convert_messages(messages),
        # )

        response = await retriever.aretrieve(question)

        return response

    async def convert_messages(self, messages):
        chat_history: List[ChatMessage] = []

        for message in messages:
            content = ""
            for key in message[1]:
                if key.startswith("_"):
                    continue

                content += f"{key}: {message[1][key]}\n"
            content += f"\n{message[0]}"

            chat_history.append(
                ChatMessage(
                    content=content,
                    role=(
                        MessageRole.ASSISTANT
                        if message[1].get("role") == "assistant"
                        else MessageRole.USER
                    ),
                )
            )

        return chat_history

    async def format_messages(self, messages):
        messages_str = "Context:\n\n"

        for message in messages:
            for key in message[1]:
                if key.startswith("_"):
                    continue

                messages_str += f"{key}: {message[1][key]}\n"
            messages_str += f"\n{message[0]}\n\n"

        return messages_str

    async def format_calendars(self, calendars):
        calendars_str = ""

        for calendar in calendars:
            for key in calendar.model_fields_set:
                calendars_str += f"{key}: {getattr(calendar, key)}\n"
            calendars_str += "\n"

        return calendars_str

    async def format_events(self, events):
        events_str = ""

        for event in events:
            for key in event.model_fields_set:
                events_str += f"{key}: {getattr(event, key)}\n"
            events_str += "\n"

        return events_str

    async def format_query(self, query: str, meta: dict[str, Any]):
        query_str = ""

        for key in meta:
            if key.startswith("_"):
                continue

            query_str += f"{key}: {meta[key]}\n"
        query_str += f"\n{query}\n\n"

        return query_str
