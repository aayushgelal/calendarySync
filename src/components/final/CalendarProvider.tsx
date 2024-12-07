import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Calendar as CalendarIcon, Check } from "lucide-react";
import { Calendar } from '@/types';

type Connection = {
  connected: boolean;
  accountId: string;
  hasValidToken: boolean;
};

type Connections = Record<string, Connection>;

const CalendarProvider: React.FC<{
  provider: string;
  onSelect?: (calendar: Calendar) => void;
  selectedId?: string;
  excludeAccountIds?: string[];
  connections: Connections;
}> = ({ provider, onSelect, selectedId, excludeAccountIds = [], connections }) => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendars = async () => {
      if (!connections[provider]?.connected || !connections[provider]?.hasValidToken) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/calendars?provider=${provider}&accountId=${connections[provider].accountId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Failed to fetch calendars');
        
        const calendarsWithAccount = data.calendars.map((cal: any) => ({
          ...cal,
          accountId: connections[provider].accountId,
          provider,
          name: provider === 'azure-ad' ? cal.name : cal.summary
        }));
        
        setCalendars(calendarsWithAccount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch calendars');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, [provider, connections]);

  if (!connections[provider]?.connected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No {provider} account connected. Please connect an account to continue.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const filteredCalendars = calendars.filter(
    cal => !excludeAccountIds.includes(cal.accountId)
  );

  return (
    <div className="space-y-2">
      {filteredCalendars.map((calendar) => (
        <div
          key={calendar.id}
          className={`p-4 rounded-lg border transition-all cursor-pointer
            ${selectedId === calendar.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-200'}`}
          onClick={() => onSelect?.(calendar)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{calendar.name}</span>
            </div>
            {selectedId === calendar.id && (
              <Check className="h-4 w-4 text-blue-500" />
            )}
          </div>
        </div>
      ))}
      {filteredCalendars.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No available calendars found
        </p>
      )}
    </div>
  );
};

export default CalendarProvider;