"use client"
import React, { useEffect, useState } from 'react';
import { Check, Loader2, X } from "lucide-react";
import { Account, GroupedAccounts, Connections } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddAccountButton } from '@/components/final/AddAccountButton';
import { useAccountStore } from '@/store/accountStore';


  
  const ConnectionStatus: React.FC<{ account?: Account }> = ({ account }) => {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
        {account ? (
          <>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">{account.email}</span>
              {account.isSubAccount && (
                <span className="text-xs text-gray-400">Sub-account</span>
              )}
            </div>
            <Badge variant="default" className="flex items-center">
              <Check className="mr-1 h-3 w-3" /> Connected
            </Badge>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-500">No account connected</span>
            <Badge variant="destructive" className="flex items-center">
              <X className="mr-1 h-3 w-3" /> Not Connected
            </Badge>
          </>
        )}
      </div>
    );
  };
  
  const ProviderSection: React.FC<{
    provider: "google" | "azure-ad";
    accounts: Account[];
    connections: Connections;
  }> = ({ provider, accounts, connections }) => {
    const displayName = provider === "azure-ad" ? "Microsoft" : "Google";
    const providerKey = provider === "azure-ad" ? "microsoft" : "google";
  
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{displayName} Accounts</h3>
          <AddAccountButton provider={provider} />
        </div>
  
        <div className="space-y-6">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <div key={account.id}>
                <ConnectionStatus account={account} />
              
              </div>
            ))
          ) : (
            <>
              <ConnectionStatus />
             
            </>
          )}
        </div>
      </>
    );
  };
  
const ProvidersPage = () => {
  const { accounts, connections, loading, fetchAccounts } = useAccountStore();

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Provider Accounts</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Google Section */}
          <ProviderSection 
            provider="google"
            accounts={accounts.google}
            connections={connections}
          />
          
          <div className="border-t my-6" />
          
          {/* Microsoft Section */}
          <ProviderSection 
            provider="azure-ad"
            accounts={accounts.microsoft}
            connections={connections}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProvidersPage;