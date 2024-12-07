import { google } from 'googleapis';
import { getGoogleOAuthClient, getMicrosoftAccessToken } from './getTokens';
import { toZonedTime } from 'date-fns-tz';




async function syncEventToTargetCalendar(sync: any, sourceEvent: any) {




    // // Determine if event should be synced based on sync settings
    // const isWeekday = new Date(sourceEvent.start.dateTime).getDay() >= 1 && 
    //                   new Date(sourceEvent.start.dateTime).getDay() <= 5;
    
    // if (sync.weekdaysOnly && !isWeekday) {
    //   return; // Skip non-weekday events if configured
    // }
    console.log(sourceEvent)
  
    // Check working hours
    const startTime = new Date(sourceEvent.start.dateTime);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const workingStart = sync.workingHoursStart.split(':').map(Number);
    const workingEnd = sync.workingHoursEnd.split(':').map(Number);
    const sourceTimeZone = 'UTC';
  
    // Round time if configured
    if (sync.roundToNearest) {
      const roundMinutes = sync.roundToNearest;
      const minutesToRound = startMinute % roundMinutes;
      startTime.setMinutes(startMinute - minutesToRound);
    }
  
    // Check if event is within working hours
    const isWithinWorkingHours = 
      (startHour > workingStart[0] || 
       (startHour === workingStart[0] && startMinute >= workingStart[1])) &&
      (startHour < workingEnd[0] || 
       (startHour === workingEnd[0] && startMinute <= workingEnd[1]));
  
    // Prepare event for target calendar
    const targetEvent: any = {
      summary: sync.hideDetails ? 'Busy' : sourceEvent.subject,
      description: sync.hideDetails ? '' : sourceEvent.description,
      start: {
        dateTime: sourceEvent.start.dateTime,
        timeZone: sourceEvent.start.timeZone
      },
      end: {
        dateTime: sourceEvent.end.dateTime,
        timeZone: sourceEvent.end.timeZone
      }
    };
    const targetEventMicrosoft = {
      subject: sync.hideDetails ? 'Busy' : sourceEvent.subject,
      body: {
        contentType: "HTML", // or "Text" if you prefer plain text
        content: sync.hideDetails ? '' : sourceEvent.description
      },
      start: {
        dateTime:sourceEvent.start.dateTime,
        timeZone: sourceEvent.start.timeZone,

      },
      end: {
        dateTime: sourceEvent.end.dateTime,
        timeZone: sourceEvent.end.timeZone,

      },
      // location: {
      //   displayName: sourceEvent.location.displayName || "No location", // Optional: if you have location info
      // },
    };
  
    // Sync to target calendar based on provider
    if (sync.targetProvider === 'google') {
      
      const { oauth2Client } = await getGoogleOAuthClient(sync.targetAccountId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      await calendar.events.insert({
        calendarId: sync.targetCalendarId,
        requestBody: targetEvent
      });
    } else if (sync.targetProvider == 'azure-ad') {
      const accessToken = await getMicrosoftAccessToken(sync.targetAccountId);
      const resultcalendar = await fetch("https://graph.microsoft.com/v1.0/me/calendars", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});
const data = await resultcalendar.json();
console.log('valid',data);
console.log(sync.targetCalendarId,sync.sourceCalendarId);

      
      const result=await fetch(`https://graph.microsoft.com/v1.0/me/calendars/${sync.targetCalendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(targetEventMicrosoft)
      });
      console.log(result.statusText)
    }
  }
export default syncEventToTargetCalendar;
  