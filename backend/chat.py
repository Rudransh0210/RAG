import re
from groq import Groq

class Chat:
    def __init__(self, api_key, model="llama3-8b-8192", temperature=1, max_tokens=2048):
        self.client = Groq(api_key=api_key)
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

    def chat(self, context ,query):
        """
        :param message: The message to be segmented
        :return: Response
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": f'''Given the {context}. Answer {query}''',
                    }
                ],
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            cleaned_query = re.sub(r'\s*\n\s*', ' ', chat_completion.choices[0].message.content).strip()
            return cleaned_query
        except Exception as e:
            return f"Error: {str(e)}"
