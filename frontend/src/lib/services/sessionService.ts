import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession } from '../types/chat';

export async function createChatSession(): Promise<string> {
  return uuidv4();
}

export async function saveSession(userId: string, sessionId: string, name?: string) {
  const session: ChatSession = {
    id: sessionId,
    name: name || `Chat ${new Date().toLocaleDateString()}`,
    timestamp: new Date(),
    lastMessage: ''
  };

  const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
  await setDoc(sessionRef, session);
  return session;
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const sessionsRef = collection(db, `users/${userId}/sessions`);
  const q = query(sessionsRef, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    timestamp: doc.data().timestamp.toDate()
  })) as ChatSession[];
}

export async function updateSessionName(userId: string, sessionId: string, name: string) {
  const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
  await updateDoc(sessionRef, { name });
}

export async function updateSessionLastMessage(userId: string, sessionId: string, lastMessage: string) {
  const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
  await updateDoc(sessionRef, { 
    lastMessage,
    timestamp: new Date()
  });
}

export async function deleteSession(userId: string, sessionId: string) {
  const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
  await deleteDoc(sessionRef);
}