import { db } from '../firebase';
import { collection, doc, getDocs, deleteDoc, query } from 'firebase/firestore';
import axios from 'axios';
import { PDFFile } from '../types/pdf';

const API_URL = 'http://127.0.0.1:5000';

export async function uploadPDFToBackend(file: File, userId: string): Promise<PDFFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
  
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    if (!response.data || !response.data.id) {
      throw new Error('Invalid backend response');
    }

    return response.data;
}
  

export async function getPDFs(userId: string): Promise<PDFFile[]> {
  const pdfsRef = collection(db, 'users', userId, 'pdfs');
  const q = query(pdfsRef);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PDFFile));
}

export async function deletePDFDocument(userId: string, pdfId: string): Promise<void> {
  // Delete from Firebase
  const pdfRef = doc(db, 'users', userId, 'pdfs', pdfId);
  await deleteDoc(pdfRef);

  // Delete from backend
  await axios.delete(`${API_URL}/delete`, {
    data: {
      userId,
      pdfId
    }
  });
}