/*
@exportId N60951VpQcqFnzlyQWy9zw
*/
module.exports = (function() {
const gcal = require('google-calendar');

return {
  listPrimaryCal(ellipsis, rangeCallback, listCallback) {
    const cal = new gcal.GoogleCalendar(ellipsis.accessTokens.googleCalendar);
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
          if (err) {
            throw new ellipsis.Error("(${err.code}: ${err.message})", { userMessage: "An error occurred fetching your calendar." });
          } else if (!res.items) {
            throw new ellipsis.Error("Unknown error", { userMessage: "There was a problem fetching your calendar. Google Calendar may be experiencing a hiccup." });
          } else {
            listCallback(res.items.slice());
          }
        });
      }
    });
  }
};

})()
     