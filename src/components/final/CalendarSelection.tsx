"use client"
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CalendarProvider from './CalendarProvider';
import { Calendar } from '@/types';

interface SyncSettings {
  hideDetails: boolean;
  weekdaysOnly: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  roundToNearest: number;
}

type Connection = {
  connected: boolean;
  accountId: string;
  hasValidToken: boolean;
};
type Connections = Record<string, Connection>;

const CalendarSelection = () => {
  const [connections, setConnections] = useState<Connections>({});
  const [sourceCalendar, setSourceCalendar] = useState<Calendar | null>(null);
  const [targetCalendar, setTargetCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections');
        const data = await response.json();
        setConnections(data);
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleSync = async () => {
    if (!sourceCalendar || !targetCalendar) return;

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCalendarId: sourceCalendar.id,
          targetCalendarId: targetCalendar.id,
          sourceProvider: sourceCalendar.provider,
          targetProvider: targetCalendar.provider,
          sourceAccountId: sourceCalendar.accountId,
          targetAccountId: targetCalendar.accountId,
        }),
      });

      if (!response.ok) throw new Error('Failed to start sync');
      alert('Sync started successfully!');
    } catch (err) {
      console.error('Sync error:', err);
      alert('Failed to start sync. Please try again.');
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
    <div className="space-y-6  ">
      <div className="flex justify-between">
      <Card>
        <CardHeader>
          <CardTitle>Source Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(connections).map(([provider, connection]) => (
            <div key={provider} className="mb-6">
              <h3 className="text-lg font-medium mb-3 capitalize">{provider}</h3>
              <CalendarProvider
                provider={provider}
                onSelect={setSourceCalendar}
                selectedId={sourceCalendar?.id}
                connections={connections}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(connections).map(([provider, connection]) => (
            <div key={provider} className="mb-6">
              <h3 className="text-lg font-medium mb-3 capitalize">{provider}</h3>
              <CalendarProvider
                provider={provider}
                onSelect={setTargetCalendar}
                selectedId={targetCalendar?.id}
                connections={connections}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      </div>

      <Button
        className="w-full"
        disabled={!sourceCalendar || !targetCalendar}
        onClick={handleSync}
      >
        Start Sync
      </Button>
    </div>
  );
};
export default CalendarSelection;