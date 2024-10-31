// src/components/Settings.tsx
interface SettingsProps {
    settings: {
      hideDetails: boolean;
      weekdaysOnly: boolean;
      workingHoursStart: string;
      workingHoursEnd: string;
      roundToNearest: number;
    };
    setSettings: (settings: any) => void;
  }
  
  export function Settings({ settings, setSettings }: SettingsProps) {
    const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });
  
    return (
      <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Sync Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hideDetails"
              checked={settings.hideDetails}
              onChange={(e) =>
                setSettings({ ...settings, hideDetails: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
            />
            <label htmlFor="hideDetails" className="ml-2 text-gray-700">
              Hide event details (show as "Busy")
            </label>
          </div>
  
          <div className="flex items-center">
            <input
              type="checkbox"
              id="weekdaysOnly"
              checked={settings.weekdaysOnly}
              onChange={(e) =>
                setSettings({ ...settings, weekdaysOnly: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
            />
            <label htmlFor="weekdaysOnly" className="ml-2 text-gray-700">
              Sync weekdays only
            </label>
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Working Hours Start
              </label>
              <select
                value={settings.workingHoursStart}
                onChange={(e) =>
                  setSettings({ ...settings, workingHoursStart: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Working Hours End
              </label>
              <select
                value={settings.workingHoursEnd}
                onChange={(e) =>
                  setSettings({ ...settings, workingHoursEnd: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Round events to nearest (minutes)
            </label>
            <select
              value={settings.roundToNearest}
              onChange={(e) =>
                setSettings({ ...settings, roundToNearest: Number(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
      </div>
    );
  }