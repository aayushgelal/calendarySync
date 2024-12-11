"use client"
import React, { useEffect, useState } from 'react';
import { Loader2, ArrowRight, Eye, EyeOff, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSyncStore } from '@/store/syncStore';


const ActiveSyncsPage = () => {
  const { syncs, loading, fetchSyncs, toggleHideDetails, deleteSync } = useSyncStore();
  



  useEffect(() => {
    fetchSyncs();
  }, []);


  
  

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