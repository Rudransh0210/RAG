import { useState } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { uploadPDFToBackend } from '../../lib/api/pdf';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { validatePDFFile, formatFileSize } from '../../lib/utils/file';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export function PDFUpload() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
  
    if (!file) {
      setSelectedFile(null);
      return;
    }
  
    if (!validatePDFFile(file)) {
      console.error('Invalid file:', file);
      setError(
        file.type !== 'application/pdf'
          ? 'Please select a valid PDF file'
          : `File size must be less than ${formatFileSize(10 * 1024 * 1024)}`
      );
      setSelectedFile(null);
      event.target.value = '';
      return;
    }
  
    setSelectedFile(file);
  };  

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
  
    setIsUploading(true);
    setError(null);
  
    try {
      const pdfData = await uploadPDFToBackend(selectedFile, user.uid);
      console.log(pdfData.id);
      if (!pdfData.id) {
        throw new Error('Failed to retrieve PDF ID from backend');
      }
  
      const pdfRef = doc(db, 'users', user.uid, 'pdfs', pdfData.id);
      await setDoc(pdfRef, {
        name: selectedFile.name,
        timestamp: Date.now(),
        userId: user.uid,
        size: selectedFile.size,
      });
  
      setSelectedFile(null);
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.value = '';

      window.location.reload();
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <FileText className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold">Upload PDF</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF (up to 10MB)</p>
            </div>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">{selectedFile.name}</span>
            </div>
            <span className="text-xs text-blue-700">{formatFileSize(selectedFile.size)}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center p-3 text-red-800 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            !selectedFile || isUploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>
    </div>
  );
}