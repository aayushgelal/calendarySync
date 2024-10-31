// Microsoft Graph API Client
export class MicrosoftGraph {
    static async getCalendars(accessToken: string) {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendars`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log(data);
      return data.value.map((calendar: any) => ({ id: calendar.id, name: calendar.name }));
    }
  
    static async updateCalendar({ accessToken, calendarId, updates }: any) {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendars/${calendarId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const updatedCalendar = await response.json();
      return updatedCalendar;
    }
  }
  
  // Google Calendar API Client
  export class GoogleCalendarAPI {
    static async getCalendars(accessToken: string) {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data.items.map((calendar: any) => ({ id: calendar.id, summary: calendar.summary }));
    }
  
    static async updateCalendar({ accessToken, calendarId, updates }: any) {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const updatedCalendar = await response.json();
      return updatedCalendar;
    }
  }
  