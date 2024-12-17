import re
from groq import Groq

class TextSegmenter:
    def __init__(self, api_key, model="llama3-8b-8192", temperature=1, max_tokens=2048):
        """
        Initializes the TextSegmenter class with the necessary parameters.
        
        :param api_key: API key for Groq
        :param model: Model to be used for generating completions
        :param temperature: Sampling temperature
        :param max_tokens: Maximum tokens for the response
        """
        self.client = Groq(api_key=api_key)
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

    def segment_text(self, message):
        """
        Segments a given message into concise semantic chunks using the Groq API.
        
        :param message: The message to be segmented
        :return: A cleaned response with the segmented text
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": f'''You are a text segmentation assistant. Divide the following message into chunks while preserving semantic meaning. Each chunk should be concise, self-contained, and represent a complete thought. Use this format:
                                        Chunk 1: <text>
                                        Chunk 2: <text>
                                        ...
                                        Message: {message}''',
                    }
                ],
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            cleaned_query = re.sub(r'\s*\n\s*', ' ', chat_completion.choices[0].message.content).strip()
            return cleaned_query
        except Exception as e:
            return f"Error during segmentation: {str(e)}"
