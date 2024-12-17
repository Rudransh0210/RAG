from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import uuid
from embedings_vectordb import VectorIntialiser
from chat import Chat
from search import DocumentSearch

app = Flask(__name__)

CORS(app)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files or 'userId' not in request.form:
        return jsonify({'error': 'File and userId are required'}), 400
    file = request.files['file']
    user_id = request.form['userId']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(file.filename)
    pdf_id = str(uuid.uuid4())
    
    USER_PATH = os.path.join(app.config['UPLOAD_FOLDER'],user_id)
    os.makedirs(USER_PATH, exist_ok=True)
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'],user_id, pdf_id+".pdf")
    file.save(file_path)
    
    vectoriser = VectorIntialiser(pdf_id, filename, user_id, file_path)
    vectoriser.vectorise()
    
    return jsonify({'message': 'File uploaded successfully', 'id': pdf_id}), 200

@app.route('/delete', methods=['DELETE'])
def delete_file():
    data = request.json
    file_name = data.get('pdfId')
    user_id = data.get('userId')

    if not file_name:
        return jsonify({'error': 'fileName is required'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'],user_id,file_name)

    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({'message': 'File deleted successfully'}), 200
    else:
        return jsonify({'error': 'File not found'}), 404

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    query = data.get('query')
    user_id = data.get('userId')

    if not query or not user_id:
        return jsonify({'error': 'query and userId are required'}), 400
    
    search = DocumentSearch()
    documents = search.search_documents(query_text=query, user_id_filter=user_id)

    max_distance_threshold = 0.5
    low_distance_docs = [doc for doc in documents if doc['distance'] < max_distance_threshold]

    if not low_distance_docs:
        return jsonify({'response': 'Sorry, I didn’t understand your question. Do you want to connect with a live agent?' }), 200
    
    context = " ".join([doc['text'] for doc in documents])
    chat_api_key = "your_groq_api_key_here"
    chat_class = Chat(api_key=chat_api_key)
    response = chat_class.chat(context=context, query=query)
    search.close()
    for entry in low_distance_docs:
        response = response + "Pdf :" + entry['title'] + "Page :" + entry['page']
    return jsonify({'response': response}), 200

if __name__ == '__main__':
    app.run(debug=True)
