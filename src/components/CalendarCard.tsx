// src/components/CalendarCard.tsx
import { Calendar } from '@/types';

interface CalendarCardProps {
  calendar: Calendar;
  selected: boolean;
  onClick: () => void;
}

export function CalendarCard({ calendar, selected, onClick }: CalendarCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 mb-4 rounded-lg border cursor-pointer transition-all ${
        selected
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: calendar.backgroundColor || '#4285f4' }}
        />
        <div>
          <h3 className="font-medium text-gray-900">{calendar.summary}</h3>
          <p className="text-sm text-gray-500">{calendar.description || 'No description'}</p>
        </div>
      </div>
    </div>
  );
}