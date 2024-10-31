// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { Plus, ChevronRight, Trash2 } from 'lucide-react';
// import { 
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle 
// } from '@/components/ui/card';
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordion';
// import { Button } from '@/components/ui/button';
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue 
// } from '@/components/ui/select';
// import {
//   Switch
// } from '@/components/ui/switch';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   Alert,
//   AlertDescription,
//   AlertTitle,
// } from '@/components/ui/alert';

// const DEFAULT_SETTINGS = {
//   hideDetails: true,
//   weekdaysOnly: true,
//   workingHoursStart: '09:00',
//   workingHoursEnd: '17:00',
//   roundToNearest: 15
// };

// export default function CalendarSync() {
//   const { data: session } = useSession();
//   const [calendars, setCalendars] = useState([]);
//   const [syncs, setSyncs] = useState([]);
//   const [activeSync, setActiveSync] = useState(null);
  
//   // Fetch calendars and existing syncs on load
//   useEffect(() => {
//     if (session) {
//       fetchCalendars();
//       fetchExistingSyncs();
//     }
//   }, [session]);

//   const fetchCalendars = async () => {
//     const res = await fetch('/api/google/calendars');
//     const data = await res.json();
//     setCalendars(data);
//   };

//   const fetchExistingSyncs = async () => {
//     const res = await fetch('/api/sync');
//     const data = await res.json();
//     setSyncs(data);
//   };

//   const handleSaveSync = async (syncData) => {
//     const res = await fetch('/api/sync', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(syncData),
//     });

//     if (res.ok) {
//       fetchExistingSyncs();
//       setActiveSync(null);
//     }
//   };

//   const handleDeleteSync = async (syncId) => {
//     const res = await fetch(`/api/sync/${syncId}`, {
//       method: 'DELETE'
//     });

//     if (res.ok) {
//       fetchExistingSyncs();
//     }
//   };

//   const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
//     const hour = Math.floor(i / 4);
//     const minute = (i % 4) * 15;
//     return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//   });

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">Calendar Syncs</h1>
//           <p className="text-muted-foreground mt-1">
//             Manage your calendar synchronization settings
//           </p>
//         </div>
        
//         <Sheet>
//           <SheetTrigger asChild>
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               New Sync
//             </Button>
//           </SheetTrigger>
//           <SheetContent className="w-[400px] sm:w-[540px]">
//             <SheetHeader>
//               <SheetTitle>Create New Sync</SheetTitle>
//             </SheetHeader>
//             <div className="mt-6 space-y-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium">Source Calendar</label>
//                   <Select
//                     onValueChange={(value) => 
//                       setActiveSync((prev) => ({...prev, sourceCalendarId: value}))
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select source calendar" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {calendars.map((calendar) => (
//                         <SelectItem key={calendar.id} value={calendar.id}>
//                           {calendar.summary}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium">Target Calendar</label>
//                   <Select
//                     onValueChange={(value) => 
//                       setActiveSync((prev) => ({...prev, targetCalendarId: value}))
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select target calendar" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {calendars.map((calendar) => (
//                         <SelectItem key={calendar.id} value={calendar.id}>
//                           {calendar.summary}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <label className="text-sm font-medium">Hide Event Details</label>
//                     <Switch
//                       checked={activeSync?.hideDetails ?? DEFAULT_SETTINGS.hideDetails}
//                       onCheckedChange={(checked) =>
//                         setActiveSync((prev) => ({ ...prev, hideDetails: checked }))
//                       }
//                     />
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <label className="text-sm font-medium">Weekdays Only</label>
//                     <Switch
//                       checked={activeSync?.weekdaysOnly ?? DEFAULT_SETTINGS.weekdaysOnly}
//                       onCheckedChange={(checked) =>
//                         setActiveSync((prev) => ({ ...prev, weekdaysOnly: checked }))
//                       }
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium">Working Hours</label>
//                     <div className="grid grid-cols-2 gap-4 mt-2">
//                       <Select
//                         value={activeSync?.workingHoursStart ?? DEFAULT_SETTINGS.workingHoursStart}
//                         onValueChange={(value) =>
//                           setActiveSync((prev) => ({ ...prev, workingHoursStart: value }))
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Start time" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {timeOptions.map((time) => (
//                             <SelectItem key={time} value={time}>
//                               {time}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>

//                       <Select
//                         value={activeSync?.workingHoursEnd ?? DEFAULT_SETTINGS.workingHoursEnd}
//                         onValueChange={(value) =>
//                           setActiveSync((prev) => ({ ...prev, workingHoursEnd: value }))
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="End time" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {timeOptions.map((time) => (
//                             <SelectItem key={time} value={time}>
//                               {time}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium">Round to Nearest</label>
//                     <Select
//                       value={String(activeSync?.roundToNearest ?? DEFAULT_SETTINGS.roundToNearest)}
//                       onValueChange={(value) =>
//                         setActiveSync((prev) => ({ ...prev, roundToNearest: Number(value) }))
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select rounding interval" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="5">5 minutes</SelectItem>
//                         <SelectItem value="15">15 minutes</SelectItem>
//                         <SelectItem value="30">30 minutes</SelectItem>
//                         <SelectItem value="60">60 minutes</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </div>

//               <Button 
//                 className="w-full"
//                 onClick={() => handleSaveSync(activeSync)}
//               >
//                 Save Sync Settings
//               </Button>
//             </div>
//           </SheetContent>
//         </Sheet>
//       </div>

//       {syncs.length === 0 ? (
//         <Alert>
//           <AlertTitle>No syncs configured</AlertTitle>
//           <AlertDescription>
//             Create your first calendar sync by clicking the New Sync button above.
//           </AlertDescription>
//         </Alert>
//       ) : (
//         <Accordion type="single" collapsible className="w-full space-y-4">
//           {syncs.map((sync) => (
//             <AccordionItem key={sync.id} value={sync.id}>
//               <AccordionTrigger>
//                 <div className="flex items-center space-x-4">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium">
//                       {calendars.find(c => c.id === sync.sourceCalendarId)?.summary} 
//                       <ChevronRight className="inline mx-2 w-4 h-4" />
//                       {calendars.find(c => c.id === sync.targetCalendarId)?.summary}
//                     </h3>
//                   </div>
//                 </div>
//               </AccordionTrigger>
//               <AccordionContent>
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <span>Hide Event Details</span>
//                         <Switch checked={sync.hideDetails} disabled />
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span>Weekdays Only</span>
//                         <Switch checked={sync.weekdaysOnly} disabled />
//                       </div>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <label className="text-sm text-muted-foreground">Working Hours Start</label>
//                           <p>{sync.workingHoursStart}</p>
//                         </div>
//                         <div>
//                           <label className="text-sm text-muted-foreground">Working Hours End</label>
//                           <p>{sync.workingHoursEnd}</p>
//                         </div>
//                       </div>
//                       <div>
//                         <label className="text-sm text-muted-foreground">Round to Nearest</label>
//                         <p>{sync.roundToNearest} minutes</p>
//                       </div>
//                       <Button 
//                         variant="destructive"
//                         onClick={() => handleDeleteSync(sync.id)}
//                         className="w-full"
//                       >
//                         <Trash2 className="w-4 h-4 mr-2" />
//                         Delete Sync
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </AccordionContent>
//             </AccordionItem>
//           ))}
//         </Accordion>
//       )}
//     </div>
//   );
// }

// export default CalendarSync;


const CalendarSync=() => {
  return <div className="div">
    
  </div>


}
export default CalendarSync