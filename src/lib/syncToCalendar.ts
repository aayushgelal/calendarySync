import { google } from 'googleapis';
import { getGoogleOAuthClient, getMicrosoftAccessToken } from './getTokens';

async function syncEventToTargetCalendar(sync: any, sourceEvent: any) {
    // Determine if event should be synced based on sync settings
    const isWeekday = new Date(sourceEvent.start.dateTime).getDay() >= 1 && 
                      new Date(sourceEvent.start.dateTime).getDay() <= 5;
    
    if (sync.weekdaysOnly && !isWeekday) {
      return; // Skip non-weekday events if configured
    }
  
    // Check working hours
    const startTime = new Date(sourceEvent.start.dateTime);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const workingStart = sync.workingHoursStart.split(':').map(Number);
    const workingEnd = sync.workingHoursEnd.split(':').map(Number);
  
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
        dateTime: startTime.toISOString(),
        timeZone: sourceEvent.start.timeZone
      },
      end: {
        dateTime: new Date(sourceEvent.end.dateTime).toISOString(),
        timeZone: sourceEvent.end.timeZone
      }
    };
  
    // Sync to target calendar based on provider
    if (sync.targetProvider === 'google') {
      const { oauth2Client } = await getGoogleOAuthClient(sync.targetAccountId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      await calendar.events.insert({
        calendarId: sync.targetCalendarId,
        requestBody: targetEvent
      });
    } else if (sync.targetProvider === 'microsoft') {
      const accessToken = await getMicrosoftAccessToken(sync.targetAccountId);
      
      await fetch(`https://graph.microsoft.com/v1.0/me/calendars/${sync.targetCalendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(targetEvent)
      });
    }
  }
export default syncEventToTargetCalendar;
  