import { create } from 'zustand';
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

interface SyncStore {
  syncs: CalendarSync[];
  loading: boolean;
  fetchSyncs: () => Promise<void>;
  toggleHideDetails: (syncId: string, currentValue: boolean) => Promise<void>;
  deleteSync: (syncId: string) => Promise<void>;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  syncs: [],
  loading: true,
  fetchSyncs: async () => {
    toast.loading('Loading syncs...');
    try {
      const response = await fetch('/api/active-syncs');
      if (!response.ok) throw new Error('Failed to fetch syncs');
      const data = await response.json();
      set({ syncs: data, loading: false });
      toast.dismiss();
    } catch (err) {
      console.error('Failed to fetch syncs:', err);
      toast.error('Failed to load syncs');
      set({ loading: false });
    }
  },
  toggleHideDetails: async (syncId: string, currentValue: boolean) => {
    toast.loading('Updating sync...');
    try {
      const response = await fetch(`/api/active-syncs/${syncId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hideDetails: !currentValue }),
      });
      
      if (!response.ok) throw new Error('Failed to update sync');
      
      const updatedSync = await response.json();
      set(state => ({
        syncs: state.syncs.map(sync => 
          sync.id === syncId ? updatedSync : sync
        )
      }));
      
      toast.success('Updated successfully');
    } catch (error) {
      console.error('Error updating sync:', error);
      toast.error('Failed to update sync');
    }
  },
  deleteSync: async (syncId: string) => {
    if (!confirm('Are you sure you want to delete this sync?')) return;
    toast.loading('Deleting sync...');
    
    try {
      const response = await fetch(`/api/active-syncs/${syncId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete sync');
      
      set(state => ({
        syncs: state.syncs.filter(sync => sync.id !== syncId)
      }));
      
      toast.success('Sync deleted successfully');
    } catch (error) {
      console.error('Error deleting sync:', error);
      toast.error('Failed to delete sync');
    }
  },
}));