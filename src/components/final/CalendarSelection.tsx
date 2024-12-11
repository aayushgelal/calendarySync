"use client"
import React, { useEffect } from 'react';
import { Loader2 } from "lucide-react";
import AccountCalendarSelector from './AccountCalendarSelector';
import SyncSettingsDialog from './SyncSettingsDialog';
import toast from 'react-hot-toast';
import { useAccountStore } from '@/store/accountStore';
import { useCalendarStore } from '@/store/calendarStore';
import { create } from 'zustand';

// Sync Settings Store
interface SyncSettingsStore {
  settings: {
    hideDetails: boolean;
    weekdaysOnly: boolean;
    workingHoursStart: string;
    workingHoursEnd: string;
    roundToNearest: number;
  };
  setSettings: (settings: SyncSettingsStore['settings']) => void;
}

const useSyncSettingsStore = create<SyncSettingsStore>((set) => ({
  settings: {
    hideDetails: true,
    weekdaysOnly: true,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    roundToNearest: 15
  },
  setSettings: (settings) => set({ settings }),
}));

const CalendarSelection = () => {
  const { accounts,fetchAccounts } = useAccountStore();
  const { selectedSource, selectedTarget, resetSelections } = useCalendarStore();
  const { settings, setSettings } = useSyncSettingsStore();

    
  useEffect(() => {
    if(accounts.google.length === 0 || accounts.microsoft.length === 0){
      fetchAccounts();
    }

     
    
  }, []);
  if(!accounts){
    return <div>Loading...</div>
  }

  const allAccounts = [...accounts.google, ...accounts.microsoft];

  const handleSync = async () => {
    if (!selectedSource || !selectedTarget) {
      toast.error("Please select both source and target calendars before syncing.");
      return;
    }


    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceCalendarId: selectedSource.id,
          targetCalendarId: selectedTarget.id,
          sourceCalendarName: selectedSource.name,
          targetCalendarName: selectedTarget.name,
          sourceProvider: selectedSource.provider,
          targetProvider: selectedTarget.provider,
          sourceAccountId: selectedSource.accountId,
          targetAccountId: selectedTarget.accountId,
          ...settings
        }),
      });

      if (!response.ok) throw new Error("Failed to start sync");
      
      resetSelections();

    } catch (err) {
      console.error("Sync error:", err);
      toast.error("Failed to start sync. Please try again.");
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <AccountCalendarSelector
          accounts={allAccounts}
          label="Source"
          isSource={true}
        />
      </div>
      
      <div className="w-1/2">
        <AccountCalendarSelector
          accounts={allAccounts}
          label="Target"
          isSource={false}
        />
      </div>

      {selectedSource && selectedTarget && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <SyncSettingsDialog
            settings={settings}
            onSettingsChange={setSettings}
            onConfirm={handleSync}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarSelection;