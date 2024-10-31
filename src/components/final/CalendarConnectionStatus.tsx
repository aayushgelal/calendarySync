"use client"
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Calendar as CalendarIcon, Check, X } from "lucide-react";
import { useSession } from "next-auth/react";

const CalendarConnectionStatus = () => {
    const { data: session } = useSession();
    const [connections, setConnections] = useState({
      google: false,
      microsoft: false
    });
  
    useEffect(() => {
      const checkConnections = async () => {
        try {
          const response = await fetch('/api/connections');
          const data = await response.json();
          setConnections(data);
        } catch (err) {
          console.error('Failed to fetch connection status:', err);
        }
      };
  
      if (session) checkConnections();
    }, [session]);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Google Calendar</span>
              {connections.google ? (
                <Badge variant="default" className="flex items-center">
                  <Check className="mr-1 h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center">
                  <X className="mr-1 h-3 w-3" /> Not Connected
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Microsoft Calendar</span>
              {connections.microsoft ? (
                <Badge variant="default" className="flex items-center">
                  <Check className="mr-1 h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center">
                  <X className="mr-1 h-3 w-3" /> Not Connected
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  export default CalendarConnectionStatus;