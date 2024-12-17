import { v4 as uuidv4 } from 'uuid';

export function generateUID(): string {
  return uuidv4();
}
  
export function validatePDFFile(file: File): boolean {
    if (!file || !file.type || !file.size) {
      return false;
    }
  
    const isPDF = file.type === 'application/pdf';
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
  
    return isPDF && isValidSize;
  }
  
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }