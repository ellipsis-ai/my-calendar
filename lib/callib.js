/*
@exportId N60951VpQcqFnzlyQWy9zw
*/
module.exports = (function() {
const gcal = require('google-calendar');

const CalLib = {
  isTimeoutError(err) {
    const code = String(err && err.code || "");
    return code.includes("ETIMEDOUT") || code.includes("ECONNRESET");
  },
  retryingErrorHandler(method, handler) {
    let retryCount = 0;
    const withRetries = (err, res) => {
      if (CalLib.isTimeoutError(err) && retryCount < 3) {
        retryCount++;
        setTimeout(() => {
          method(withRetries);
        }, retryCount * 100);
      } else {
        handler(err, res);
      }
    };
    method(withRetries);
  },
  getCalApi(ellipsis) {
    return new gcal.GoogleCalendar(ellipsis.accessTokens.googleCalendar);
  },
  listPrimaryCal(ellipsis, rangeCallback, listCallback) {
    return CalLib.listCal(ellipsis, "primary", rangeCallback, listCallback);
  },
  listCal(ellipsis, calId, rangeCallback, listCallback) {
    const cal = CalLib.getCalApi(ellipsis);
    CalLib.retryingErrorHandler((handler) => {
      cal.calendars.get(calId, handler);
    }, (err, res) => {
      if (err) {
        throw new ellipsis.Error(err, {
          userMessage: "An error occurred while fetching your calendar from Google."
        });
      } else {
        const range = rangeCallback(res.timeZone || ellipsis.userInfo.timeZone || ellipsis.teamInfo.timeZone);
        CalLib.retryingErrorHandler((handler) => {
          cal.events.list(calId, {
            timeMin: range.min,
            timeMax: range.max,
            orderBy: 'startTime',
            singleEvents: true
          }, handler);
        }, (err, res) => {
          const errorMessage = "An error occurred while checking your Google calendar for events. The problem may be temporary.";
          if (err) {
            throw new ellipsis.Error(err, {
              userMessage: errorMessage
            });
          } else if (!res.items) {
            throw new ellipsis.Error("Google Calendar returned an invalid response (no items).", {
              userMessage: errorMessage
            });
          } else {
            listCallback(res.items.slice());
          }
        })
      }
    });
  },
  updateEvent(ellipsis, eventId, eventDetails, updateCallback) {
    const cal = CalLib.getCalApi(ellipsis);
    CalLib.retryingErrorHandler((handler) => {
      cal.events.update("primary", eventId, eventDetails, {
        sendNotifications: true
      }, handler);
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
    CalLib.retryingErrorHandler((handler) => {
      cal.events.delete("primary", eventId, {
        sendNotifications: true
      }, handler);
    }, (err, res) => {
      if (err) {
        throw new ellipsis.Error(err, {
          userMessage: "An error occurred while trying to delete the calendar event."
        });
      } else {
        deleteCallback(res);
      }
    });
  },
  listCalendars(ellipsis, listCallback) {
    const cal = CalLib.getCalApi(ellipsis);
    CalLib.retryingErrorHandler((handler) => {
      cal.calendarList.list(handler);
    }, (err, res) => {
      if (err) {
        throw new ellipsis.Error(err, {
          userMessage: "An error occurred while trying to get the list of calendars."
        });
      } else if (!res.items) {
        throw new ellipsis.Error("Google Calendar returned an invalid response (no calendars).", {
          userMessage: "An error occurred while trying to get the list of calendars. No calendars were found."
        });
      } else {
        listCallback(res.items.slice());
      }
    });
  }
};

return CalLib;
})()
     