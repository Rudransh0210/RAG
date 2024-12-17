import { PDFUpload } from '@/components/dashboard/pdf-upload';
import { PDFList } from '@/components/dashboard/pdf-list';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your PDFs and start chatting with them
        </p>
      </div>

      <div className="grid gap-6">
        <PDFUpload />
        <PDFList />
      </div>
    </div>
  );
}