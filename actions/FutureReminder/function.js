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
const escapeRegex = require('escape-string-regexp');
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
    const dayGroups = eventlib.groupEventsByDay(items, min, max, calTz);
    const formatted = eventlib.formatEventsGroupedByDay(dayGroups, filterOriginal);
    ellipsis.success(`
**_Upcoming events:_ ${filterOriginal}**

${formatted}
`);
  }
});

function formatDayGroup(dateString, eventTitles, filter) {
  const escapedFilter = escapeRegex(filter);
  const titlesWithoutFilter = eventTitles.map((ea) => ea.replace(new RegExp(`\\(?\\b${escapedFilter}\\b\\)?:?`), "").replace(/ +/, " ").trim());
  return `**${dateString}:** ${titlesWithoutFilter.join(", ")}`;
}
}
