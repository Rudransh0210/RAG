import { useEffect, useState } from 'react';
import { useAuth } from './../../lib/hooks/useAuth';
import { getPDFs, deletePDFDocument } from './../../lib/api/pdf';
import { PDFFile } from './../../lib/types/pdf';
import { format } from 'date-fns';

export function PDFList() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPDFs();
    }
  }, [user]);

  const loadPDFs = async () => {
    if (!user) return;
    
    try {
      const pdfList = await getPDFs(user.uid);
      setPdfs(pdfList);
    } catch (error) {
      console.error('Failed to load PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (pdfId: string) => {
    if (!user) return;

    try {
      await deletePDFDocument(user.uid, pdfId);
      setPdfs(pdfs.filter(pdf => pdf.id !== pdfId));
      alert('PDF deleted successfully');
    } catch (error) {
      console.error('Failed to delete PDF:', error);
      alert('Failed to delete PDF');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Your PDFs</h2>
      {pdfs.length === 0 ? (
        <p className="text-gray-500">No PDFs uploaded yet</p>
      ) : (
        <ul className="space-y-4">
          {pdfs.map((pdf) => (
            <li key={pdf.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
              <div>
                <h3 className="font-medium">{pdf.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(pdf.timestamp, 'PPP')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(pdf.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}