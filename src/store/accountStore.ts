import { create } from 'zustand';
import { Account, GroupedAccounts, Connections } from '@/types';

interface AccountStore {
  accounts: GroupedAccounts;
  connections: Connections;
  loading: boolean;
  fetchAccounts: () => Promise<void>;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: {
    google: [],
    microsoft: [],
  },
  connections: {
    google: { connected: false, accountId: '', hasValidToken: false },
    microsoft: { connected: false, accountId: '', hasValidToken: false }
  },
  loading: true,
  fetchAccounts: async () => {
    try {
      const response = await fetch('/api/accounts');
      const data: Account[] = await response.json();
      
      // Group accounts by provider
      const grouped = data.reduce((acc, account) => {
        const provider = account.provider === "azure-ad" ? "microsoft" : "google";
        acc[provider].push(account);
        return acc;
      }, { google: [], microsoft: [] } as GroupedAccounts);
      
      // Create connections object
      const newConnections = data.reduce((acc, account) => {
        const provider = account.provider === "azure-ad" ? "microsoft" : "google";
        acc[provider] = {
          connected: true,
          accountId: account.id,
          hasValidToken: true
        };
        return acc;
      }, {
        google: { connected: false, accountId: '', hasValidToken: false },
        microsoft: { connected: false, accountId: '', hasValidToken: false }
      });

      set({ 
        accounts: grouped, 
        connections: newConnections,
        loading: false 
      });
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      set({ loading: false });
    }
  },
}));