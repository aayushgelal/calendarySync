"use client"
import CalendarAccountsManager from "@/components/final/CalendarAccountsManager";
import CalendarSelection from "@/components/final/CalendarSelection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Connections } from "@/types";
import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";


const ConnectionStatus: React.FC<{
  connections: Connections;
  provider: string;
}> = ({ connections, provider }) => {
  const connection = connections[provider];

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <span className="font-medium capitalize">{provider}</span>
      {connection?.connected ? (
        <Badge variant="default" className="flex items-center">
          <Check className="mr-1 h-3 w-3" /> Connected
        </Badge>
      ) : (
        <Badge variant="destructive" className="flex items-center">
          <X className="mr-1 h-3 w-3" /> Not Connected
        </Badge>
      )}
    </div>
  );
};

// Main Calendar Dashboard Component
const CalendarDashboard = () => {
  const [connections, setConnections] = useState<Connections>({});
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Calendar Management</h1>
      
      {/* <CalendarAccountsManager /> */}
      
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(connections).map((provider) => (
            <ConnectionStatus
              key={provider}
              provider={provider}
              connections={connections}
            />
          ))}
        </CardContent>
      </Card>
      
      <CalendarSelection />
    </div>
  );
};

export default CalendarDashboard;