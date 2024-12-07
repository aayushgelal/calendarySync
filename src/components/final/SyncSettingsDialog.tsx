import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast';


type SyncSettings = {
  hideDetails: boolean;
  weekdaysOnly: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  roundToNearest: number;
};

type SyncSettingsDialogProps = {
  settings: SyncSettings;
  onSettingsChange: (settings: SyncSettings) => void;
  onConfirm: () => void;
};

const SyncSettingsDialog: React.FC<SyncSettingsDialogProps> = ({
  settings,
  onSettingsChange,
  onConfirm,
}) => {

  return (
    <Dialog>
      <DialogTrigger asChild className='self-center relative left-1/2 right-1/2'>
        <Button className="w-1/4">Start Sync</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="hideDetails">Hide Event Details</Label>
            <Switch
              id="hideDetails"
              checked={settings.hideDetails}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, hideDetails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="weekdaysOnly">Weekdays Only</Label>
            <Switch
              id="weekdaysOnly"
              checked={settings.weekdaysOnly}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, weekdaysOnly: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Working Hours</Label>
            <div className="flex gap-2">
              <Select
                value={settings.workingHoursStart}
                onValueChange={(value) =>
                  onSettingsChange({ ...settings, workingHoursStart: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={settings.workingHoursEnd}
                onValueChange={(value) =>
                  onSettingsChange({ ...settings, workingHoursEnd: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Round to Nearest (minutes)</Label>
            <Select
              value={settings.roundToNearest.toString()}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, roundToNearest: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rounding" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 30, 60].map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={onConfirm}>
            Confirm and Start Sync
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncSettingsDialog;