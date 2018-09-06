function(calendar, filterOriginal, daysAhead, ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.1.0');
const eventlib = require('eventlib');
const callib = require('callib');
const filter = filterOriginal.toLowerCase();
const calendarId = calendar.id;
const EllipsisApi = ellipsis.require("ellipsis-api@0.1.1");
const usersApi = new EllipsisApi(ellipsis).users;
const inspect = require('util').inspect;
let now, min, max, calTz;
callib.listCal(ellipsis, calendarId, (tz) => {
  calTz = tz;
  moment.tz.setDefault(calTz);
  now = moment();
  min = now.clone();
  max = min.clone().add(daysAhead, 'days');
  return {
    min: min.toISOString(),
    max: max.toISOString()
  };
}, (resultItems) => {
  const items = resultItems.filter((ea) => {
    const summary = (ea.summary || "").toLowerCase();
    const description = (ea.description || "").toLowerCase();
    return summary.includes(filter) || description.includes(filter);
  });
  if (items.length === 0) {
    ellipsis.success(`There are no events with “${filterOriginal}” in the next ${daysAhead} days.`)
  } else {
    processEvents(items).then((processedEvents) => {
      ellipsis.success(`
**Upcoming events:**

${processedEvents.map(formatEvent).join("")}
`);
    });
  }
});

function processEvents(events) {
  return Promise.all(events.map((event) => {
    const title = `${Formatter.formatEventDateTime(event, calTz, null, true)} **${event.summary || "(untitled)"}**`;
    const attendees = (event.attendees || []).filter((ea) => !ea.organizer && !ea.resource);
    return Promise.all(attendees.map((attendee) => {
      return usersApi.findUserByEmail(attendee.email).then((resp) => {
        const users = resp.users;
        const user = users ? users[0] : null;
        const userString = user ?
              `<@${user.userIdForContext}>` :
              (attendee.displayName || attendee.email);
        return userString;
      });
    })).then((userStrings) => {
      return {
        title: title,
        users: userStrings.join(", ")
      };
    });
  }));                    
}

function formatEvent(event) {
  return `- ${event.title}${event.users ? " - " + event.users : ""}\n`;
}
}
