function(ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.0.14');
const eventlib = require('eventlib');
const calLib = require('callib');
let calTz, now;

calLib.listPrimaryCal(ellipsis, (tz) => {
  calTz = tz;
  moment.tz.setDefault(calTz);
  now = moment();
  const min = now.clone();
  const max = now.clone().startOf('day').add(1, 'days');
  return {
    min: min.toISOString(),
    max: max.toISOString()
  };
}, (resultItems) => {
  const items = eventlib.filterDeclined(resultItems);
  let heading = "";
  if (items.length === 0) {
    heading = "🎉 There’s nothing on your calendar for the rest of the day.";
  } else if (items.length === 1) {
    heading = "There’s 1 event on your calendar today:";
  } else {
    heading = `There are ${items.length} events on your calendar today:`;
  }
  const result = {
    heading: heading,
    items: items.map((event) => {
      return Object.assign({}, event, {
        formattedEvent: Formatter.formatEvent(event, calTz, now.format(Formatter.formats.YMD))
      });
    })
  };
  ellipsis.success(result);  
});
}
