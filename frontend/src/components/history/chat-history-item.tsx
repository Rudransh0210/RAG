import { MessageSquare, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistoryItemProps {
  title: string;
  date: string;
  time: string;
  preview: string;
  documentName: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ChatHistoryItem({
  title,
  date,
  time,
  preview,
  documentName,
  selected,
  onClick,
}: ChatHistoryItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border p-4 transition-colors',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:bg-gray-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-gray-400" />
          <h3 className="ml-2 font-medium text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {date}
          </span>
          <span className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {time}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{preview}</p>
      <p className="mt-1 text-xs text-gray-500">Document: {documentName}</p>
    </div>
  );
}