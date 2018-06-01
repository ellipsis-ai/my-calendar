/*
@exportId N60951VpQcqFnzlyQWy9zw
*/
module.exports = (function() {
const gcal = require('google-calendar');

const CalLib = {
  getCalApi(ellipsis) {
    return new gcal.GoogleCalendar(ellipsis.accessTokens.googleCalendar);
  },
  listPrimaryCal(ellipsis, rangeCallback, listCallback) {
    const cal = CalLib.getCalApi(ellipsis);
    cal.calendars.get("primary", (err, res) => {
      if (err) {
        throw new ellipsis.Error(`An error occurred retrieving your primary calendar (${err.code}): ${err.message}`, {
          userMessage: "An error occurred while fetching your calendar from Google. You may try running `...what's on my calendar today` again to see if it was temporary."
        });
      } else {
        const range = rangeCallback(res.timeZone || ellipsis.userInfo.timeZone || ellipsis.teamInfo.timeZone);
        cal.events.list("primary", {
          timeMin: range.min,
          timeMax: range.max,
          orderBy: 'startTime',
          singleEvents: true
        }, (err, res) => {
          const errorMessage = "An error occurred while checking your Google calendar for events. The problem may be temporary.";
          if (err) {
            throw new ellipsis.Error(`Error ${err.code}: ${err.message}`, {
              userMessage: errorMessage
            });
          } else if (!res.items) {
            throw new ellipsis.Error("Google Calendar returned an invalid response (no items).", {
              userMessage: errorMessage
            });
          } else {
            listCallback(res.items.slice());
          }
        });
      }
    });
  },
  updateEvent(ellipsis, eventId, eventDetails, updateCallback) {
    const cal = CalLib.getCalApi(ellipsis);
    cal.events.update("primary", eventId, eventDetails, {
      sendNotifications: true
    }, (err, res) => {
      if (err) {
        throw new ellipsis.Error(err.message || err, {
          userMessage: "An error occurred while trying to update the calendar event."
        });
      } else {
        updateCallback(res);
      }
    });
  },
  deleteEvent(ellipsis, eventId, deleteCallback) {
    const cal = CalLib.getCalApi(ellipsis);
    cal.events.delete("primary", eventId, {
      sendNotifications: true
    }, (err, res) => {
      if (err) {
        throw new ellipsis.Error(err, {
          userMessage: "An error occurred while trying to delete the calendar event."
        });
      } else {
        deleteCallback(res);
      }
    });
  }
};

return CalLib;
})()
     