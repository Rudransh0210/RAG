import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils/file';
import { PDFFile } from '@/lib/types/pdf';

interface PDFItemProps {
  pdf: PDFFile;
  onDelete: (uid: string) => void;
}

export function PDFItem({ pdf, onDelete }: PDFItemProps) {
  const formattedDate = new Date(pdf.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <li className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6">
      <div className="flex items-center">
        <FileText className="h-5 w-5 text-gray-400" />
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{pdf.name}</p>
          <p className="text-xs text-gray-500">
            Uploaded on {formattedDate} • {formatFileSize(pdf.size)}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(pdf.uid)}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}