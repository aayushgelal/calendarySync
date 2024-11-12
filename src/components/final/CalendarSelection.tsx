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
  
  // New state for sync settings
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    hideDetails: true,
    weekdaysOnly: true,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    roundToNearest: 15
  });

  // State to track sync configuration step
  const [configStep, setConfigStep] = useState<'calendar-selection' | 'sync-config' | 'confirm'>('calendar-selection');

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
          ...syncSettings
        }),
      });

      if (!response.ok) throw new Error('Failed to start sync');
      alert('Sync started successfully!');
      // Reset to initial state
      setConfigStep('calendar-selection');
      setSourceCalendar(null);
      setTargetCalendar(null);
    } catch (err) {
      console.error('Sync error:', err);
      alert('Failed to start sync. Please try again.');
    }
  };

  const handleSettingChange = (key: keyof SyncSettings, value: boolean | string | number) => {
    setSyncSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // Calendar Selection Step
  if (configStep === 'calendar-selection') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Card className="w-[48%]">
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

          <Card className="w-[48%]">
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
          onClick={() => setConfigStep('sync-config')}
        >
          Next: Configure Sync
        </Button>
      </div>
    );
  }

  // Sync Configuration Step
  if (configStep === 'sync-config') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
          <CardDescription>Customize your calendar sync settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="hide-details" className="flex-1">Hide Event Details</Label>
            <Switch
              id="hide-details"
              checked={syncSettings.hideDetails}
              onCheckedChange={(checked) => handleSettingChange('hideDetails', checked)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <Label htmlFor="weekdays-only" className="flex-1">Sync Only Weekdays</Label>
            <Switch
              id="weekdays-only"
              checked={syncSettings.weekdaysOnly}
              onCheckedChange={(checked) => handleSettingChange('weekdaysOnly', checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="working-hours-start">Working Hours Start</Label>
              <Input
                id="working-hours-start"
                type="time"
                value={syncSettings.workingHoursStart}
                onChange={(e) => handleSettingChange('workingHoursStart', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="working-hours-end">Working Hours End</Label>
              <Input
                id="working-hours-end"
                type="time"
                value={syncSettings.workingHoursEnd}
                onChange={(e) => handleSettingChange('workingHoursEnd', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="round-to-nearest">Round Events To (minutes)</Label>
            <Select 
              value={syncSettings.roundToNearest.toString()} 
              onValueChange={(value) => handleSettingChange('roundToNearest', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rounding interval" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 30, 60].map(interval => (
                  <SelectItem key={interval} value={interval.toString()}>
                    {interval} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="w-1/2" 
              onClick={() => setConfigStep('calendar-selection')}
            >
              Back
            </Button>
            <Button 
              className="w-1/2" 
              onClick={handleSync}
            >
              Start Sync
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default CalendarSelection;