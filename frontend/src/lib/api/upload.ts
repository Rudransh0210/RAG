import { UploadResponse } from '@/lib/types/pdf';

const API_URL = 'http://127.0.0.1:5000/upload';

export async function uploadPDF(file: File, uid: string): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uid', uid);
    formData.append('timestamp', Date.now().toString());
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return { success: true, file: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}