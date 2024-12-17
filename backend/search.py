import weaviate

class DocumentSearch:
    def __init__(self, headers=None):
        self.headers = headers or {}
        self.client = weaviate.connect_to_local(headers=self.headers)
        self.documents = self.client.collections.get("Document")

    def search_documents(self, query_text, user_id_filter=None, limit=5):
        """
        Search for documents based on a query and optional filter for userId.

        :param query_text: The text query to search for.
        :param user_id_filter: Optional filter to apply on the userId property.
        :param limit: The number of documents to return (default is 5).
        :return: List of documents matching the search query and filter.
        """
        filters = []

        if user_id_filter:
            filters.append(
                weaviate.Filter.by_property("userId").equal_to(user_id_filter)
            )

        response = self.documents.query.near_text(
            query=query_text,
            limit=limit,
            return_metadata=weaviate.MetadataQuery(distance=True),
            filters=filters
        )
        
        result = []
        for obj in response.objects:
            result.append({
                "title": obj.properties.get("pdfName"),
                "page": obj.properties.get("page"),
                "text": obj.properties.get("text"),
                "user_id": obj.properties.get("userId"),
                "distance": obj.metadata.distance
            })
        
        return result

    def close(self):
        """Close the Weaviate client connection."""
        self.client.close()

