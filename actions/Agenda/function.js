function(ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.0.14');
const eventlib = require('eventlib');
const calLib = require('callib');
const EllipsisApi = require('ellipsis-api');
const actionsApi = new EllipsisApi(ellipsis).actions;

const dayOfWeek = moment().tz(ellipsis.userInfo.timeZone || ellipsis.teamInfo.timeZone).isoWeekday();
if (dayOfWeek === 1) {
  actionsApi.say({
    message: "It’s Monday today, so let’s first look back at last week.\n\n---\n\n"
  }).then(() => {
    return actionsApi.run({
      actionName: "ActivityReport"
    });
  }).then(() => {
    return actionsApi.say({
      message: "---\n\nAnd here’s your agenda for today:"
    })
  }).then(() => {
    todaysAgenda();
  });
} else {
  todaysAgenda();
}

function todaysAgenda() {
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
}
