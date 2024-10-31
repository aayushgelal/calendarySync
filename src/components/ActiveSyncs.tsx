// src/components/ActiveSyncs.tsx
'use client';

import { useState } from 'react';
// import { CalendarSync } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface ActiveSyncsProps {
  syncs: any;
}

export function ActiveSyncs({ syncs }: ActiveSyncsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (syncId: string) => {
    setLoading(syncId);
    try {
      const res = await fetch(`/api/sync/${syncId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting sync:', error);
    }
    setLoading(null);
  };

  if (syncs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No active syncs</h3>
        <p className="mt-2 text-sm text-gray-500">
          Create your first calendar sync below
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Active Syncs</h3>
        <div className="mt-4 space-y-4">
          {syncs.map((sync:any) => (
            <div
              key={sync.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {sync.sourceCalendarId} → {sync.targetCalendarId}
                </p>
                <p className="text-sm text-gray-500">
                  {sync.weekdaysOnly ? 'Weekdays only' : 'All days'} •{' '}
                  {sync.hideDetails ? 'Hidden details' : 'Showing details'} •{' '}
                  {sync.workingHoursStart} - {sync.workingHoursEnd}
                </p>
              </div>
              <button
                onClick={() => handleDelete(sync.id)}
                disabled={loading === sync.id}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
              >
                {loading === sync.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}