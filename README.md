## **Table of Contents**
1. **Overview**
2. **Backend Setup**
   - Firebase Authentication
   - Weaviate Setup
   - File Upload & Deletion Endpoints
   - Chat Functionality with Fallback Logic
   - Chat History and Session Management
3. **Frontend Setup**
   - Firebase Authentication in React
   - File Upload & Deletion Components in React
   - Chat Component in React
   - Session Management and Chat History in React
4. **Interaction Flow**
5. **Error Handling**
6. **Styling and Customization**
7. **Future Enhancements**

---

## 1. **Overview**

This system integrates **Firebase** for user authentication, **Weaviate** for document search, **Groq API (Chat)** for generating chat-based responses, and **session management** for tracking user conversations.

- **User Authentication**: Firebase Authentication is used to manage user sign-in and session management.
- **File Upload**: Users can upload PDF files, which are stored in Firebase Storage and indexed in Weaviate for search purposes.
- **File Deletion**: Users can delete their uploaded files, removing both the file from Firebase Storage and its metadata from Weaviate.
- **Document Search**: Weaviate allows querying documents based on user input and returns relevant results for further interaction.
- **Chat Functionality**: The chat interface lets users interact with the system to get relevant information from documents. Fallback logic is triggered if the response distance is too large or the query is unclear.
- **Chat History and Session Management**: Each interaction is stored as part of a session, allowing users to view past chat interactions.

---

## 2. **Backend Setup**

### **Firebase Authentication**

Firebase Authentication is used to authenticate users and ensure only authorized users can upload, delete, or query documents.

#### **Authentication Flow**:

1. **User Sign-In**:
   - Users sign in using Firebase Authentication (email/password, Google, etc.).
   - A **JWT token** is generated and returned to the frontend for making authenticated API requests.
   - The backend validates this token using Firebase Admin SDK to verify the user’s identity before processing requests.

2. **JWT Token Verification**:
   - When a request is made (e.g., uploading a file or querying documents), the JWT token sent from the frontend is verified on the backend. If the token is valid, the request proceeds; otherwise, a 401 Unauthorized error is returned.

### **Weaviate Setup**

Weaviate is a vector-based database used for document search. It indexes document content and metadata, allowing fast retrieval of documents relevant to user queries.

#### **Document Indexing**:
- When a PDF file is uploaded, its content is extracted, and metadata (title, user ID, page, content) is indexed into Weaviate.
- The backend uses **Weaviate's vector search** to match a user’s query with the most relevant documents based on the content.

#### **Document Search**:
- The user sends a query, and the backend uses Weaviate to search for the most relevant documents.
- The results returned include the document title, content, and the page number of the matched content.

### **File Upload & Deletion Endpoints**

#### **File Upload**:
- Users can upload PDF files, which are stored in Firebase Storage.
- Metadata (title, user ID, etc.) is indexed in Weaviate for searchability.
- The file’s URL is returned after a successful upload.

#### **File Deletion**:
- Users can delete files they have uploaded.
- Files are removed from Firebase Storage and the corresponding document metadata is deleted from Weaviate’s index.

#### **Endpoint Design**:
- **POST /upload**: Accepts a PDF file and metadata, uploads it to Firebase Storage, and indexes it in Weaviate.
- **DELETE /delete**: Deletes a file from Firebase Storage and removes it from Weaviate’s index.

---

### **Chat Functionality with Fallback Logic**

#### **Purpose**:
The chat feature allows users to interact with the system. The user sends a query (e.g., "What is the eligibility criteria?"), and the backend processes the query by searching documents using Weaviate. If no relevant documents are found or if the query distance is large, a fallback response is triggered.

#### **Endpoints**:
- **POST /chat**: Accepts a **query** and **userId** and processes the chat by retrieving relevant documents, generating a response, and returning the response to the frontend.

#### **Fallback Logic**:
- When documents are found but the **distance** (similarity score) is too large (indicating a poor match to the query), a fallback message is returned to the user.
  - The fallback message is: `"Sorry, I didn’t understand your question. Do you want to connect with a live agent?"`
  - This avoids returning irrelevant or incorrect information when the query is not well understood by the system.

#### **Response**:
- If the distance is low (good match), a relevant document-based answer is generated.
- If the distance is high (poor match), a fallback response is returned.

#### **Process**:
1. The query and user ID are received.
2. **DocumentSearch**: Weaviate is queried for documents relevant to the input.
3. **Fallback Check**: If the document similarity distance exceeds a threshold (e.g., `0.8`), a fallback response is triggered.
4. **Chat Response Generation**: If relevant documents are found, they are concatenated, and the query is passed to the **Chat class** (Groq API) to generate a response.
5. The final response is returned, containing either:
   - The answer from the model with references to documents (`pdfName` and `page`).
   - A fallback message if no relevant documents are found.

### **Chat History and Session Management**

#### **Session Creation and Management**:
- **Session ID**: Each user session is uniquely identified by a **session ID**.
- **Session Storage**: The session stores all messages exchanged between the user and the bot.
- **Multiple Sessions**: Users can have multiple active sessions, and each session can have its own history of messages.

#### **Endpoints for Session Management**:
- **POST /session**: Creates a new session for a user.
- **GET /session/{sessionId}/messages**: Retrieves the entire message history for a specific session.
- **POST /session/{sessionId}/message**: Sends a message in an existing session, both from the user and the bot.

#### **Session and Message Flow**:
1. **Session Creation**: A session is created for each new conversation, and a unique **session ID** is assigned.
2. **Messages**: Both user and bot messages are stored in Firebase Firestore under the user’s session. Each message contains:
   - `text`: The content of the message.
   - `timestamp`: When the message was sent.
   - `response`: Identifies whether the message is from the user or bot.
3. **Retrieve Chat History**: For each new chat request, the chat history is fetched using the session ID and displayed in the chat interface.
4. **End of Session**: Sessions are typically active until the user logs out or the session expires.

---

## 3. **Frontend Setup**

### **Firebase Authentication in React**

- Users authenticate via Firebase (email/password, Google).
- The frontend stores the **JWT token** in **localStorage** or **sessionStorage**.
- The token is sent in the **Authorization header** with each API request to authenticate the user.

### **File Upload & Deletion Components in React**

- **File Upload**: A file input allows the user to upload PDFs. The file is sent to the backend for storage and indexing.
- **File Deletion**: The user can delete files they’ve uploaded. The frontend sends a request to the backend to delete the file.

### **Chat Component in React**

- **User Input**: A text input field for users to type their query.
- **Chat History**: Displays the chat conversation, showing both the user’s and bot’s messages. The chat history is fetched for each session from the backend.
- **Backend Interaction**: On submitting the query, the frontend sends a POST request to the `/chat` endpoint, passing the **query** and **userId**.
- **Response Handling**:
  - If a response is received, it is displayed in the chat window.
  - If no documents are found or if the fallback is triggered,i.e., the distance of the searched query is greater than a threshold a fallback message is displayed.

### **Session Management in React**

- **Session ID**: Each chat interaction is associated with a session ID. This session ID is stored in **localStorage**.
- **Session History**: The frontend retrieves the chat history for the current session and displays it to the user.
- **Chat History Persistence**: Chat messages are retained for the duration of the session, and past messages can be accessed by the user.

---

## 4. **Interaction Flow**

1. **User Login**: User logs in using Firebase Authentication, and the frontend stores the JWT token.
2. **Session Creation**: A session is created on the backend with a unique session ID.
3. **File Upload**: User uploads a PDF file. The file is saved to Firebase Storage, and metadata is indexed in Weaviate.
4. **Query & Response**: User submits a query via the chat. The backend searches relevant documents, processes the query, and generates a response using Weaviate and the Chat class.
5. **File Deletion**: User deletes a file, and it is removed from Firebase Storage and Weaviate.
6. **Chat History Retrieval

**: Past messages from the current session are displayed.
7. **Fallback Response**: If the distance score is too high (irrelevant match), a fallback message is sent to the user.

---

## 5. **Error Handling**

- **Authentication Errors**: If the JWT token is invalid or missing, the backend returns a `401 Unauthorized` error.
- **File Upload Errors**: If the file is not provided or if there’s an issue with the storage, the backend returns a `400 Bad Request` error.
- **File Deletion Errors**: If the file doesn’t exist, the backend returns a `404 Not Found` error.
- **Query Errors**: If no documents are found or the query is unclear, the fallback message is returned.
- **Session Management Errors**: If a session ID is missing or invalid, the backend returns a `400 Bad Request` error.

---

## 6. **Styling and Customization**

- **Frontend UI**: The file upload, deletion, and chat components should follow the application’s design guidelines, with appropriate buttons, input fields, and feedback mechanisms.
- **Chat Interface**: The chat window should be styled with alternating messages (user and bot), a scrolling history, and a text input field for user queries.
- **Error Handling UI**: Display errors in a user-friendly manner, such as showing "File not found" or "Authentication failed" messages.

---

## 7. **Future Enhancements**

1. **File Search**: Allow users to search for files they’ve uploaded using keywords or metadata.
2. **Advanced Querying**: Add support for more complex queries, including filters based on document metadata, date ranges, etc.
3. **Live Agent Integration**: Enable real-time connections with live agents when the fallback message is triggered.
4. **Chat Analytics**: Analyze user queries and chatbot performance to improve responses and fallback logic.
5. **Session Timeout**: Implement session expiration after a set period of inactivity.

---

### **Summary**

This documentation outlines the entire system architecture, including **user authentication**, **file upload/deletion**, **document search using Weaviate**, **chat functionality with fallback logic**, and **chat history with session management**. The system ensures secure file management, smooth user interaction, and persistence of chat sessions to provide a better user experience.