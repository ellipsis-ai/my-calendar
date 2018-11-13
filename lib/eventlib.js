/*
@exportId AjtTiS-fTzKYaHsNUUpZqg
*/
module.exports = (function() {
const moment = require('moment-timezone');

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
    return Object.keys(dayGroups).sort().map((date) => ({
      date: date,
      events: dayGroups[date]
    }));
  }
}

})()
     