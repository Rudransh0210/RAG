import fitz
import json
import uuid
import re
from groq_handling import TextSegmenter

class PDFProcessor:
    def __init__(self, pdf_id, pdf_name, user_id, pdf_path):
        """
        Initializes the PDFProcessor with necessary metadata.
        
        :param pdf_id: Unique identifier for the PDF
        :param pdf_name: Name of the PDF file
        :param user_id: ID of the user processing the PDF
        :param pdf_path: Path to the PDF file
        """
        self.pdf_id = pdf_id
        self.pdf_name = pdf_name
        self.user_id = user_id
        self.pdf_path = pdf_path
        self.text_segmenter = TextSegmenter("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")

    @staticmethod
    def replace_asterisks_with_space(text):
        """
        Replaces double asterisks in the text with spaces.
        
        :param text: The input text
        :return: Cleaned text
        """
        return re.sub(r"\*\*", "", text)

    @staticmethod
    def process_llm_output(text):
        """
        Splits LLM output into chunks based on the specified pattern.
        
        :param text: The LLM output
        :return: List of cleaned chunks
        """
        chunks = re.split(r'Chunk\s+\d+:\s*', text)
        return [chunk.strip() for chunk in chunks if chunk.strip()]

    def extract_paragraphs_from_pdf(self):
        """
        Extracts paragraphs from the PDF, splitting text by double newlines.
        
        :return: List of tuples containing page numbers and paragraphs
        """
        paragraphs = []
        document = fitz.open(self.pdf_path)
        for page_num in range(len(document)):
            page = document.load_page(page_num)
            text = page.get_text("text")
            page_paragraphs = text.split('\n\n')
            page_paragraphs = [para.strip() for para in page_paragraphs if para.strip()]
            paragraphs.extend((page_num + 1, para) for para in page_paragraphs)
        return paragraphs

    def process_pdf_to_json(self):
        """
        Processes the PDF paragraphs, segments them with the LLM, and outputs to a JSON file.
        
        :param chat_reply_function: A callable function to handle LLM-based segmentation
        :return: Path to the output JSON file
        """
        final_chunks = []
        paragraphs = self.extract_paragraphs_from_pdf()
        
        for page_num, paragraph in paragraphs:
            llm_output = self.text_segmenter.segment_text(paragraph)
            llm_output = self.replace_asterisks_with_space(llm_output)
            chunks = self.process_llm_output(llm_output)
            
            for chunk in chunks:
                final_chunks.append({
                    "pdf-id": self.pdf_id,
                    "pdf-name": self.pdf_name,
                    "user-id": self.user_id,
                    "page": page_num,
                    "pdf-path": self.pdf_path,
                    "uid": str(uuid.uuid4()),
                    "text": chunk
                })
        
        for i in range(len(final_chunks)):
            if i > 0:
                final_chunks[i]["prev_uid"] = final_chunks[i - 1]["uid"]
            if i < len(final_chunks) - 1:
                final_chunks[i]["next_uid"] = final_chunks[i + 1]["uid"]
            if i == 0:
                final_chunks[i]["prev_uid"] = final_chunks[i]["uid"]
            if i == len(final_chunks) - 1:
                final_chunks[i]["next_uid"] = final_chunks[i]["uid"]

        output_json_path = f"{self.pdf_id}_processed.json"
        with open(output_json_path, "w", encoding="utf-8") as json_file:
            json.dump(final_chunks, json_file, ensure_ascii=False, indent=4)
        
        return output_json_path

