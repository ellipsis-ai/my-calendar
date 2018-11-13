/*
@exportId AjtTiS-fTzKYaHsNUUpZqg
*/
module.exports = (function() {
const moment = require('moment-timezone');
const escapeRegex = require('escape-string-regexp');

return {
  filterDeclined: function(events) {
    return events.filter((event) => {
      const selfAttend = (event.attendees || []).find((ea) => ea.self);
      const response = selfAttend ? selfAttend.responseStatus : null;
      return response !== "declined";
    });
  },

  groupEventsByDay: function(events, min, max, calTz) {
    moment.tz.setDefault(calTz);
    const dayGroups = {};
    events.forEach((event) => {
      let dayGroup;
      const dayStart = min.clone().startOf('day');
      const dayEnd = dayStart.clone().endOf('day');
      const eventStart = moment(event.start.dateTime || event.start.date);
      const eventEnd = moment(event.end.dateTime || event.end.date);
      while (dayStart <= max) {
        const dayString = dayStart.format("YYYY-MM-DD");
        if ((eventStart.isBefore(dayEnd) && eventEnd.isAfter(dayStart))) {
          if (!dayGroups[dayString]) {
            dayGroups[dayString] = [];
          }
          dayGroup = dayGroups[dayString];
          const summary = (event.summary || "(Untitled event)").trim();
          dayGroup.push(summary);
        }
        dayStart.add(1, 'day');
        dayEnd.add(1, 'day');
      }
    });
    return Object.keys(dayGroups).sort().map((dateString) => {
      return {
        date: dateString,
        events: dayGroups[dateString]
      };
    });
  },

  formatEventsGroupedByDay(dayGroups, filterToRemove) {
    const escapedFilter = escapeRegex(filterToRemove);
    const filterRegex = new RegExp(`\\(?\\b${escapedFilter}\\b\\)?:?`, 'i');
    const formattedTitles = dayGroups.map((group) => {
      return group.events.map((ea) => {
        return ea.replace(filterRegex, "")
          .replace(/ +/, " ").trim()
      }).join(", ");
    });
    const formattedGroups = [];
    dayGroups.forEach((group, index) => {
      const day = moment(group.date);
      const dayTitles = formattedTitles[index];
      let prevGroup, prevDay, prevTitles, prevFormattedGroup;
      if (index > 0) {
        prevGroup = dayGroups[index - 1];
        prevDay = moment(prevGroup.date);
        prevTitles = formattedTitles[index - 1];
        prevFormattedGroup = formattedGroups[formattedGroups.length - 1];
      }
      if (prevFormattedGroup && prevDay.add(1, 'day').isSame(day, 'day') && prevTitles === dayTitles) {
        prevFormattedGroup.days.push(day);
      } else {
        formattedGroups.push({
          days: [day],
          titles: dayTitles
        });
      }
    });
    return formattedGroups.map((group) => {
      const days = group.days;
      const firstDay = days[0].format("dddd M/D");
      const dateString = days.length === 1 ?
        firstDay : `${firstDay} to ${days[days.length - 1].format("dddd M/D")}`
      return `**${dateString}:** ${group.titles}`;
    }).join("\n\n");
  }
}

})()
     