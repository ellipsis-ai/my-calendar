function(ellipsis) {
  const moment = require('moment-timezone');
const eventlib = require('eventlib');
const callib = require('callib');
let now, min, max, calTz;

callib.listCalendars(ellipsis, (items) => {
  ellipsis.success(items.map((calendar) => {
    return Object.assign({}, calendar, {
      label: calendar.summary
    });
  }));
});
}
