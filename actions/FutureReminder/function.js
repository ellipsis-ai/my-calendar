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
    const dayGroups = eventlib.groupEventsByDay(items, min, max, calTz);
    ellipsis.success(`
_Upcoming events:_ **${filterOriginal}**

${dayGroups.map((group) => formatDayGroup(group.date, group.events)).join("\n\n")}
`);
  }
});

function formatDayGroup(dateString, eventTitles) {
  return `**${moment(dateString).format("dddd M/D")}:** ${eventTitles.join(" • ")}`;
}
}
