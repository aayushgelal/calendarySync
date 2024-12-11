import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Calendar } from '@/types';

interface CalendarStore {
  calendars: {
    [accountId: string]: Calendar[];
  };
  loading: boolean;
  selectedSource: Calendar | null;
  selectedTarget: Calendar | null;
  fetchCalendars: (accountId: string, provider: string) => Promise<void>;
  setSelectedSource: (calendar: Calendar | null) => void;
  setSelectedTarget: (calendar: Calendar | null) => void;
  resetSelections: () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  calendars: {},
  loading: false,
  selectedSource: null,
  selectedTarget: null,

  fetchCalendars: async (accountId: string, provider: string) => {
    // Check if we already have calendars for this account
    const existingCalendars = get().calendars[accountId];
    if (existingCalendars?.length > 0) {
      return; // Don't fetch if we already have calendars
    }

    set({ loading: true });
    
    try {
      const response = await fetch(`/api/calendars?accountId=${accountId}&provider=${provider}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch calendars');
      
      // Transform the calendars to include accountId and provider
      const transformedCalendars = data.calendars.map((cal: any) => ({
        ...cal,
        accountId,
        provider,
        name: provider === 'azure-ad' ? cal.name : cal.summary,
        accessRole: cal.accessRole || 'reader' // Add a default if not present
      }));
      
      set((state) => ({
        calendars: {
          ...state.calendars,
          [accountId]: transformedCalendars
        },
        loading: false
      }));

      console.log('Calendars stored:', transformedCalendars);
    } catch (error) {
      console.error('Error fetching calendars:', error);
      toast.error('Failed to fetch calendars');
      set({ loading: false });
    }
  },

  setSelectedSource: (calendar) => {
    set({ selectedSource: calendar });
  },

  setSelectedTarget: (calendar) => {
    // Prevent selecting the same calendar as source and target
    const { selectedSource } = get();
    if (calendar && selectedSource?.id === calendar.id) {
      toast.error("Cannot select the same calendar as source and target");
      return;
    }
    set({ selectedTarget: calendar });
  },

  resetSelections: () => {
    set({ 
      selectedSource: null, 
      selectedTarget: null 
    });
  },
}));