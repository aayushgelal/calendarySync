// import { google } from 'googleapis';
// import { getGoogleOAuthClient, getMicrosoftAccessToken } from './getTokens';
// import { toZonedTime } from 'date-fns-tz';




// async function syncEventToTargetCalendar(sync: any, sourceEvent: any) {




//     // // Determine if event should be synced based on sync settings
//     // const isWeekday = new Date(sourceEvent.start.dateTime).getDay() >= 1 && 
//     //                   new Date(sourceEvent.start.dateTime).getDay() <= 5;
    
//     // if (sync.weekdaysOnly && !isWeekday) {
//     //   return; // Skip non-weekday events if configured
//     // }
//     console.log(sourceEvent)
  
//     // Check working hours
//     const startTime = new Date(sourceEvent.start.dateTime);
//     const startHour = startTime.getHours();
//     const startMinute = startTime.getMinutes();
//     const workingStart = sync.workingHoursStart.split(':').map(Number);
//     const workingEnd = sync.workingHoursEnd.split(':').map(Number);
//     const sourceTimeZone = 'UTC';
  
//     // Round time if configured
//     if (sync.roundToNearest) {
//       const roundMinutes = sync.roundToNearest;
//       const minutesToRound = startMinute % roundMinutes;
//       startTime.setMinutes(startMinute - minutesToRound);
//     }
  
//     // Check if event is within working hours
//     const isWithinWorkingHours = 
//       (startHour > workingStart[0] || 
//        (startHour === workingStart[0] && startMinute >= workingStart[1])) &&
//       (startHour < workingEnd[0] || 
//        (startHour === workingEnd[0] && startMinute <= workingEnd[1]));
  
//     // Prepare event for target calendar
//     const targetEvent: any = {
//       summary: sync.hideDetails ? 'Busy' : sourceEvent.subject,
//       description: sync.hideDetails ? '' : sourceEvent.description,
//       start: {
//         dateTime: sourceEvent.start.dateTime,
//         timeZone: sourceEvent.start.timeZone
//       },
//       end: {
//         dateTime: sourceEvent.end.dateTime,
//         timeZone: sourceEvent.end.timeZone
//       }
//     };
//     const targetEventMicrosoft = {
//       subject: sync.hideDetails ? 'Busy' : sourceEvent.subject,
//       body: {
//         contentType: "HTML", // or "Text" if you prefer plain text
//         content: sync.hideDetails ? '' : sourceEvent.description
//       },
//       start: {
//         dateTime:sourceEvent.start.dateTime,
//         timeZone: sourceEvent.start.timeZone,

//       },
//       end: {
//         dateTime: sourceEvent.end.dateTime,
//         timeZone: sourceEvent.end.timeZone,

//       },
//       // location: {
//       //   displayName: sourceEvent.location.displayName || "No location", // Optional: if you have location info
//       // },
//     };
  
//     // Sync to target calendar based on provider
//     if (sync.targetProvider === 'google') {
      
//       const { oauth2Client } = await getGoogleOAuthClient(sync.targetAccountId);
//       const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
//       await calendar.events.insert({
//         calendarId: sync.targetCalendarId,
//         requestBody: targetEvent
//       });
//     } else if (sync.targetProvider == 'azure-ad') {
//       const accessToken = await getMicrosoftAccessToken(sync.targetAccountId);
//       const resultcalendar = await fetch("https://graph.microsoft.com/v1.0/me/calendars", {
//   method: "GET",
//   headers: {
//     Authorization: `Bearer ${accessToken}`,
//     "Content-Type": "application/json",
//   },
// });
// const data = await resultcalendar.json();
// console.log('valid',data);
// console.log(sync.targetCalendarId,sync.sourceCalendarId);

      
//       const result=await fetch(`https://graph.microsoft.com/v1.0/me/calendars/${sync.targetCalendarId}/events`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(targetEventMicrosoft)
//       });
//       console.log(result.statusText)
//     }
//   }
// export default syncEventToTargetCalendar;
  
import { google } from 'googleapis';
import { getGoogleOAuthClient, getMicrosoftAccessToken } from './getTokens';
import { addMinutes, isBefore, isAfter, setMinutes } from 'date-fns';

async function syncEventToTargetCalendar(sync: any, sourceEvent: any) {
  try {
    // Skip if event doesn't have necessary data
    if (!sourceEvent?.start?.dateTime || !sourceEvent?.end?.dateTime) {
      console.log('Skipping event without proper date/time data');
      return;
    }


    // Parse start and end times
    const startTime = new Date(sourceEvent.start.dateTime);
    const endTime = new Date(sourceEvent.end.dateTime);
    
    // Check if it's a weekday (1-5 is Monday-Friday)
    const isWeekday = startTime.getDay() >= 1 && startTime.getDay() <= 5;
    if (sync.weekdaysOnly && !isWeekday) {
      console.log('Skipping non-weekday event');
      return; // Skip non-weekday events if configured
    }

    // Parse working hours
    const workingStartParts = sync.workingHoursStart.split(':').map(Number);
    const workingEndParts = sync.workingHoursEnd.split(':').map(Number);
    
    // Create Date objects for working hours on the same day as the event
    const workingStartTime = new Date(startTime);
    workingStartTime.setHours(workingStartParts[0], workingStartParts[1], 0, 0);
    
    const workingEndTime = new Date(startTime);
    workingEndTime.setHours(workingEndParts[0], workingEndParts[1], 0, 0);

    // Check if event is within working hours
    const isWithinWorkingHours = 
      isAfter(startTime, workingStartTime) && 
      isBefore(startTime, workingEndTime);
    
    if (!isWithinWorkingHours && sync.workingHoursStart !== '00:00' && sync.workingHoursEnd !== '00:00') {
      console.log('Skipping event outside working hours');
      return; // Skip events outside working hours if configured
    }

    // Apply time rounding if configured
    let roundedStartTime = new Date(startTime);
    let roundedEndTime = new Date(endTime);
    
    if (sync.roundToNearest > 0) {
      // Round start time
      const startMinutes = startTime.getMinutes();
      const roundDownMinutes = Math.floor(startMinutes / sync.roundToNearest) * sync.roundToNearest;
      roundedStartTime = setMinutes(roundedStartTime, roundDownMinutes);
      
      // Round end time
      const endMinutes = endTime.getMinutes();
      const roundUpMinutes = Math.ceil(endMinutes / sync.roundToNearest) * sync.roundToNearest;
      roundedEndTime = setMinutes(roundedEndTime, roundUpMinutes >= 60 ? 0 : roundUpMinutes);
      if (roundUpMinutes >= 60) {
        roundedEndTime.setHours(roundedEndTime.getHours() + 1);
      }
    }

    // Prepare event data for target calendars
    const targetEventGoogle = {
      summary: sync.hideDetails ? 'Busy' : sourceEvent.summary || sourceEvent.subject,
      description: sync.hideDetails ? '' : (sourceEvent.description || ''),
      start: {
        dateTime: roundedStartTime.toISOString(),
        timeZone: sourceEvent.start.timeZone || 'UTC'
      },
      end: {
        dateTime: roundedEndTime.toISOString(),
        timeZone: sourceEvent.end.timeZone || 'UTC'
      },
      // Add a custom property to identify synced events
      extendedProperties: {
        private: {
          syncedFromSourceId: sourceEvent.id,
          syncedFrom: sync.sourceCalendarId
        }
      }
    };
    
    const targetEventMicrosoft = {
      subject: sync.hideDetails ? 'Busy' : sourceEvent.summary || sourceEvent.subject,
      body: {
        contentType: "HTML",
        content: sync.hideDetails ? '' : (sourceEvent.description || '')
      },
      start: {
        dateTime: roundedStartTime.toISOString(),
        timeZone: sourceEvent.start.timeZone || 'UTC'
      },
      end: {
        dateTime: roundedEndTime.toISOString(),
        timeZone: sourceEvent.end.timeZone || 'UTC'
      },
      // Add a custom property to identify synced events
      singleValueExtendedProperties: [
        {
          id: "String {00020329-0000-0000-C000-000000000046} Name syncedFromSourceId",
          value: sourceEvent.id
        },
        {
          id: "String {00020329-0000-0000-C000-000000000046} Name syncedFrom",
          value: sync.sourceCalendarId
        }
      ]
    };

    // Check if event already exists in target calendar to prevent duplicates
    if (sync.targetProvider === 'google') {
      const { oauth2Client } = await getGoogleOAuthClient(sync.targetAccountId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Fix: privateExtendedProperty needs to be an array of strings
      const existingEvents = await calendar.events.list({
        calendarId: sync.targetCalendarId,
        privateExtendedProperty: [`syncedFromSourceId=${sourceEvent.id}`]
      });
      
      if (existingEvents.data.items && existingEvents.data.items.length > 0) {

        const existingEventId = existingEvents.data.items[0].id;

        // Update existing event
        await calendar.events.update({
          calendarId: sync.targetCalendarId,
          eventId: existingEventId!,
          requestBody: targetEventGoogle
        });
        console.log('Updated existing event in Google calendar');
      } else {
        // Create new event
        await calendar.events.insert({
          calendarId: sync.targetCalendarId,
          requestBody: targetEventGoogle
        });
        console.log('Created new event in Google calendar');
      }
    } else if (sync.targetProvider === 'azure-ad') {
      const accessToken = await getMicrosoftAccessToken(sync.targetAccountId);
      
      // Check for existing event with same source ID
      const queryParams = new URLSearchParams({
        $filter: `singleValueExtendedProperties/any(ep: ep/id eq 'String {00020329-0000-0000-C000-000000000046} Name syncedFromSourceId' and ep/value eq '${sourceEvent.id}')`
      });
      
      const existingEventsResponse = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendars/${sync.targetCalendarId}/events?${queryParams.toString()}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const existingEvents = await existingEventsResponse.json();
      
      if (existingEvents.value && existingEvents.value.length > 0) {
        // Update existing event
        await fetch(
          `https://graph.microsoft.com/v1.0/me/calendars/${sync.targetCalendarId}/events/${existingEvents.value[0].id}`, 
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(targetEventMicrosoft)
          }
        );
        console.log('Updated existing event in Microsoft calendar');
      } else {
        // Create new event
        await fetch(
          `https://graph.microsoft.com/v1.0/me/calendars/${sync.targetCalendarId}/events`, 
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(targetEventMicrosoft)
          }
        );
        console.log('Created new event in Microsoft calendar');
      }
    }
  } catch (error) {
    console.error('Error syncing event to target calendar:', error);
    throw error;
  }
}

export default syncEventToTargetCalendar;