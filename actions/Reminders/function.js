function(ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.0.13');
const eventlib = require('eventlib');
const callib = require('callib');
let now, calTz;

callib.listPrimaryCal(ellipsis, (tz) => {
  calTz = tz;
  moment.tz.setDefault(calTz);
  now = moment();
  const min = now.clone();
  const max = now.clone().add(8, 'minutes');
  return {
    min: min.toISOString(),
    max: max.toISOString()
  };
}, (resultItems) => {
  const items = eventlib.filterDeclined(resultItems.filter((ea) => {
    return ellipsis.event.originalEventType !== 'scheduled' || moment(ea.start.dateTime).isAfter(now.clone().add(2, 'minutes').add(50, 'seconds'))
  }));
  if (items.length === 0) {
    if (ellipsis.event.originalEventType === "scheduled") {
      ellipsis.noResponse();
    } else {
      ellipsis.success({
        hasItems: false
      });
    }
  } else {
    ellipsis.success({
      hasItems: true,
      heading: items.length > 1 ?
        `Reminder: there are ${items.length} events on your calendar.` :
        `Reminder: there’s an event on your calendar.`,
      items: items.map((event) => {
        return Object.assign({}, event, {
          formattedEvent: Formatter.formatEvent(event, calTz, now.format(Formatter.formats.YMD), { details: true })
        });
      })
    });
  }  
});
}
