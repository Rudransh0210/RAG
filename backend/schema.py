import weaviate
import weaviate.classes.config as wc

headers = {} 
client = weaviate.connect_to_local(headers=headers)
client.collections.create(
    name="Document",
    properties=[
            wc.Property(name="userId", data_type=wc.DataType.TEXT),
            wc.Property(name="pdfId", data_type=wc.DataType.TEXT),
            wc.Property(name="uid", data_type=wc.DataType.TEXT),
            wc.Property(name="nextUid", data_type=wc.DataType.TEXT),
            wc.Property(name="prevUid", data_type=wc.DataType.TEXT),
            wc.Property(name="pdfName", data_type=wc.DataType.TEXT),
            wc.Property(name="page", data_type=wc.DataType.INT),
            wc.Property(name="text", data_type=wc.DataType.TEXT),
            wc.Property(name="embedding", data_type=wc.DataType.BLOB)
        ]
)
print("Schema for 'Document' collection created successfully!")
client.close()