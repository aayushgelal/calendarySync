"use client"
import React, { useEffect, useState } from 'react';
import { Loader2, ArrowRight, Eye, EyeOff, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import toast from 'react-hot-toast';

type CalendarSync = {
  id: string;
  sourceCalendarName: string;
  targetCalendarName: string;
  sourceAccount: {
    email: string;
  };
  targetAccount: {
    email: string;
  };
  hideDetails: boolean;
};

const ActiveSyncsPage = () => {
  const [syncs, setSyncs] = useState<CalendarSync[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyncs();
  }, []);

const fetchSyncs = async () => {
  toast.loading('Loading syncs...');
    try {
      const response = await fetch('/api/active-syncs');
      if (!response.ok) throw new Error('Failed to fetch syncs');
      const data = await response.json();
      setSyncs(data);
      toast.dismiss();
    } catch (err) {
      console.error('Failed to fetch syncs:', err);
      toast.error('Failed to load syncs');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleHideDetails = async (syncId: string, currentValue: boolean) => {
    toast.loading('Updating sync...');
    try {
      const response = await fetch(`/api/active-syncs/${syncId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hideDetails: !currentValue }),
      });
      toast.dismiss();
      if (!response.ok) toast.error('Failed to update sync');
      const updatedSync = await response.json();
  
      setSyncs(syncs.map(sync => 
        sync.id === syncId ? updatedSync : sync
      ));
  
      toast.success('Updated successfully');
    } catch (error) {
      console.error('Error updating sync:', error);
      toast.error('Failed to update sync');
    }
  };
  
  const deleteSync = async (syncId: string) => {
    if (!confirm('Are you sure you want to delete this sync?')) return;
    toast.loading('Deleting sync...');
  
    try {
      const response = await fetch(`/api/active-syncs/${syncId}`, {
        method: 'DELETE',
      });
      toast.dismiss();

      if (!response.ok) toast.error('Failed to delete sync');
  
      setSyncs(syncs.filter(sync => sync.id !== syncId));
      toast.success('Sync deleted successfully');
    } catch (error) {
      console.error('Error deleting sync:', error);
      toast.error('Failed to delete sync');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Syncs</h1>
      </div>
      
      <div className="grid gap-4">
        {syncs.length > 0 ? (
          syncs.map((sync) => (
            <Card key={sync.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <p className="font-medium">{sync.sourceAccount.email}</p>
                      <p className="text-sm text-gray-500">{sync.sourceCalendarName}</p>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    
                    <div className="flex-1">
                      <p className="font-medium">{sync.targetAccount.email}</p>
                      <p className="text-sm text-gray-500">{sync.targetCalendarName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {sync.hideDetails ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <Switch
                        checked={!sync.hideDetails}
                        onCheckedChange={() => toggleHideDetails(sync.id, sync.hideDetails)}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSync(sync.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No active syncs found.</p>
            <p className="text-sm">Create a new sync to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSyncsPage;