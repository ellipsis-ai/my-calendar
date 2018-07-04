function(calendar, filterOriginal, includeFollowingWeek, ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.1.0');
const eventlib = require('eventlib');
const callib = require('callib');
const filter = filterOriginal.toLowerCase();
const calendarId = calendar.id;

let now, min, max, calTz;
callib.listCal(ellipsis, calendarId, (tz) => {
  calTz = tz;
  moment.tz.setDefault(calTz);
  now = moment();
  min = now.clone();
  max = min.clone().add(includeFollowingWeek ? 2 : 1, 'weeks');
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
    ellipsis.success(`There are no events with “${filterOriginal}” in the next week.`)
  } else if (items.length === 1) {
    ellipsis.success(`
**Upcoming event:**

- ${formatEvent(items[0])}
`);
  } else {
    ellipsis.success(`
**Upcoming events:**

- ${items.map(formatEvent).join("\n- ")}
`);
  }
});

function formatEvent(event) {
  const title = `${Formatter.formatEventDateTime(event, calTz, null, true)} **${event.summary || "(untitled)"}**`;
  const attendees = formatAttendees(event);
  return `${title} — ${attendees}`;
}

function formatAttendees(event) {
  const attendees = (event.attendees || []).filter((ea) => !ea.organizer && !ea.resource);
  return attendees.map(formatAttendee).join(", ");
}

function formatAttendee(attendee) {
  const displayName = attendee.displayName || attendee.email;
  return displayName === attendee.email ?
    displayName : `${displayName} (${attendee.email})`;
}
}
