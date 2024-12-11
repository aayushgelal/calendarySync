"use client"
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarStore } from '@/store/calendarStore';
import { Calendar } from '@/types';
import { Loader2 } from 'lucide-react';

type Account = {
  id: string;
  provider: string;
  email: string;
  isSubAccount: boolean;
};

type AccountCalendarSelectorProps = {
  accounts: Account[];
  label: string;
  isSource?: boolean;
};

const AccountCalendarSelector: React.FC<AccountCalendarSelectorProps> = ({
  accounts,
  label,
  isSource = false,
}) => {
  const { 
    calendars,
    loading,
    selectedSource,
    selectedTarget,
    fetchCalendars,
    setSelectedSource,
    setSelectedTarget
  } = useCalendarStore();

  // Add state for current account
  const [currentAccountId, setCurrentAccountId] = React.useState<string | null>(null);

  const selectedCalendar = isSource ? selectedSource : selectedTarget;
  const currentAccount = accounts.find(a => a.id === currentAccountId);

  const handleAccountChange = useCallback(async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    console.log('Account selected:', account);
    setCurrentAccountId(accountId); // Set the current account

    // Reset calendar selection
    if (isSource) {
      setSelectedSource(null);
    } else {
      setSelectedTarget(null);
    }

    // Fetch calendars if not already cached
    if (!calendars[accountId]) {
      console.log('Fetching calendars for account:', accountId);
      await fetchCalendars(accountId, account.provider);
    }
  }, [accounts, calendars, fetchCalendars, setSelectedSource, setSelectedTarget, isSource]);

  console.log('Rendering with selectedAccount:', currentAccount);
  console.log('Available calendars:', calendars[currentAccount?.id || '']);

  const handleCalendarSelect = useCallback((calendar: Calendar) => {
    if (isSource) {
      setSelectedSource(calendar );
    } else {
      setSelectedTarget(calendar);
    }
  }, [setSelectedSource, setSelectedTarget, isSource]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={currentAccountId || ''} // Use currentAccountId instead of selectedAccount
          onValueChange={handleAccountChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()} account`} />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.email} {account.isSubAccount ? '(Sub-account)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentAccount && ( // Use currentAccount instead of selectedAccount
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {calendars[currentAccount.id]?.map((calendar) => (
                  <button
                    key={calendar.id}
                    onClick={() => handleCalendarSelect(calendar)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      selectedCalendar?.id === calendar.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {calendar.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountCalendarSelector;