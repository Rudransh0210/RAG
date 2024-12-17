import { db } from '../firebase';
import { collection, addDoc, query, orderBy, getDocs, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types/chat';
import { updateSessionLastMessage } from './sessionService';

export async function getChatMessages(userId: string, sessionId: string): Promise<ChatMessage[]> {
  const messagesRef = collection(db, `users/${userId}/sessions/${sessionId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    timestamp: doc.data().timestamp.toDate()
  })) as ChatMessage[]; 
}

async function sendQueryToBackend(query: string, userId: string): Promise<string> {
  const response = await fetch('http://127.0.0.1:5000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query,
      userId: userId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get response from backend');
  }

  const data = await response.json();
  return data.response;
}

export async function sendMessage(userId: string, sessionId: string, text: string) {
  const messageId = uuidv4();
  const messagesRef = doc(db, `users/${userId}/sessions/${sessionId}/messages`, messageId);
  
  const message: ChatMessage = {
    id: messageId,
    text,
    response: 'user',
    timestamp: new Date()
  };

  await setDoc(messagesRef, message);
  await updateSessionLastMessage(userId, sessionId, text);
  const response = await sendQueryToBackend(text, userId)
  const botMessageId = uuidv4();
  const botMessage: ChatMessage = {
    id: botMessageId,
    text: response,
    response: 'bot',
    timestamp: new Date()
  };

  const botMessageRef = doc(db, `users/${userId}/sessions/${sessionId}/messages`, botMessageId);
  await setDoc(botMessageRef, botMessage);

  return {
    userMessage: message,
    botMessage: botMessage
  };
}