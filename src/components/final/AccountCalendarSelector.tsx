"use client"
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CalendarProvider from './CalendarProvider';
import { Calendar } from '@/types';

type Account = {
  id: string;
  provider: string;
  email: string;
  isSubAccount: boolean;
};

type AccountCalendarSelectorProps = {
  accounts: Account[];
  label: string;
  onCalendarSelect: (calendar: Calendar | null) => void;
};

const AccountCalendarSelector: React.FC<AccountCalendarSelectorProps> = ({
  accounts,
  label,
  onCalendarSelect,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

  const handleAccountChange = useCallback(
    (accountId: string) => {
      const account = accounts.find((a) => a.id === accountId) || null;
      setSelectedAccount(account);
      setSelectedCalendarId(null);
      onCalendarSelect(null);
    },
    [accounts, onCalendarSelect]
  );

  const handleCalendarSelect = useCallback((calendar: Calendar) => {
    setSelectedCalendarId(calendar.id);
    onCalendarSelect(calendar);
  }, [onCalendarSelect]);

  const connections = useMemo(() => {
    if (!selectedAccount) return {};
    return {
      [selectedAccount.provider]: {
        connected: true,
        accountId: selectedAccount.id,
        hasValidToken: true,
      },
    };
  }, [selectedAccount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedAccount?.id}
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

        {selectedAccount && (
          <div className="mt-4">
            <CalendarProvider
              provider={selectedAccount.provider}
              onSelect={handleCalendarSelect}
              selectedId={selectedCalendarId!}
              connections={connections}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountCalendarSelector;