import React, { useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Calendar as CalendarIcon, Check } from "lucide-react";
import { Calendar } from '@/types';
import { useCalendarStore } from '@/store/calendarStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
  const { 
    calendars, 
    loading, 
    fetchCalendars,
    setSelectedSource,
    setSelectedTarget,
    selectedSource,
    selectedTarget
  } = useCalendarStore();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCalendars(connections[provider].accountId, provider);
      } catch (error) {
        if (error instanceof Error && error.message.includes('AUTH_REQUIRED')) {
          toast.error('Please reconnect your account');
          // Redirect to re-auth or show re-auth button
          router.push(`/auth/reconnect?provider=${provider}`);
        }
      }
    };

    fetchData();
  }, [provider, connections]);

  const handleSelect = (calendar: Calendar) => {
    if (onSelect) {
      onSelect(calendar);
    }
    
    if (selectedId === selectedSource?.id) {
      setSelectedSource(calendar);
    } else if (selectedId === selectedTarget?.id) {
      setSelectedTarget(calendar);
    }
  };

  console.log('Calendars from store:', calendars);
  console.log('Current provider account:', connections[provider]?.accountId);
  
  const accountCalendars = calendars[connections[provider]?.accountId] || [];
  console.log('Filtered account calendars:', accountCalendars);

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

  const filteredCalendars = accountCalendars.filter(
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
          onClick={() => handleSelect(calendar)}
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