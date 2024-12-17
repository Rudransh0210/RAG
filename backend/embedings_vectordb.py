import weaviate
import os
import json
from weaviate.util import generate_uuid5
from processor import PDFProcessor
from sentence_transformers import SentenceTransformer

class VectorIntialiser:
    
    def __init__(self, pdf_id, pdf_name, user_id, pdf_path):
        self.processor = PDFProcessor(pdf_id, pdf_name, user_id, pdf_path)
        self.json_path = self.processor.process_pdf_to_json()
        self.model = SentenceTransformer(model_name_or_path="all-mpnet-base-v2",device="cpu")

    def vectorise(self):
        headers = {}
        try:    
            client = weaviate.connect_to_local(headers=headers)
            documents = client.collections.get("Document")
            with open(self.json_path, "r", encoding="utf-8") as json_file:
                data = json.load(json_file)
            
            for entry in data:
                embedding = self.model.encode(entry['text'])
                obj = {
                    "userId": entry['user-id'],
                    "pdfId": entry['pdf-id'],
                    "uid": entry['uid'],
                    "nextUid": entry['next_uid'],
                    "prevUid": entry['prev_uid'],
                    "pdfName": entry['pdf-name'],
                    "page": entry['page'],
                    "text": entry['text'],
                    "embedding": embedding.tolist()
                }
                documents.data.insert(
                    properties = obj
                )
            
        finally:
            client.close()
        if os.path.exists(self.json_path):
            os.remove(self.json_path)