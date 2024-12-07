"use client"
import React, { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";
import AccountCalendarSelector from './AccountCalendarSelector';
import SyncSettingsDialog from './SyncSettingsDialog';
import { Calendar } from '@/types';
import toast from 'react-hot-toast';

type Account = {
  id: string;
  provider: string;
  email: string;
  isSubAccount: boolean;
};

type SyncSettings = {
  hideDetails: boolean;
  weekdaysOnly: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  roundToNearest: number;
};

const CalendarSelection = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceCalendar, setSourceCalendar] = useState<Calendar | null>(null);
  const [targetCalendar, setTargetCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    hideDetails: true,
    weekdaysOnly: true,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    roundToNearest: 15
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleSync = async () => {
    if (!sourceCalendar || !targetCalendar) {
      alert("Please select both source and target calendars before syncing.");
      return;
    }
    console.log(sourceCalendar, targetCalendar);
    toast.loading("Syncing calendars...");

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceCalendarId: sourceCalendar.id,
          targetCalendarId: targetCalendar.id,
          sourceCalendarName: sourceCalendar.name,
          targetCalendarName: targetCalendar.name,
          sourceProvider: sourceCalendar.provider,
          targetProvider: targetCalendar.provider,
          sourceAccountId: sourceCalendar.accountId,
          targetAccountId: targetCalendar.accountId,
        }),
      });
      toast.dismiss();

      if (!response.ok) throw new Error("Failed to start sync");
      setSourceCalendar(null);
      setTargetCalendar(null);
      toast.success("Sync started successfully!");

    } catch (err) {
      console.error("Sync error:", err);
      alert("Failed to start sync. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <AccountCalendarSelector
          accounts={accounts}
          label="Source"
          onCalendarSelect={setSourceCalendar}
        />
      </div>
      
      <div className="w-1/2">
        <AccountCalendarSelector
          accounts={accounts}
          label="Target"
          onCalendarSelect={setTargetCalendar}
        />
      </div>

      {sourceCalendar && targetCalendar && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <SyncSettingsDialog
            settings={syncSettings}
            onSettingsChange={setSyncSettings}
            onConfirm={handleSync}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarSelection;