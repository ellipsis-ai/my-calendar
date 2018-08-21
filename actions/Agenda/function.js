function(ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.1.0');
const eventlib = require('eventlib');
const calLib = require('callib');
const EllipsisApi = ellipsis.require("ellipsis-api@0.1.1");
const actionsApi = new EllipsisApi(ellipsis).actions;
const RandomResponse = require('ellipsis-random-response');
const timeZone = ellipsis.userInfo.timeZone || ellipsis.teamInfo.timeZone;
const greetingText = RandomResponse.greetingForTimeZone(timeZone);
const dayOfWeek = moment().tz(timeZone).isoWeekday();

if (dayOfWeek === 1) {
  actionsApi.say({
    message: `${greetingText}\n\nIt’s Monday today, so let’s look back at last week.\n\n---\n\n`
  }).then(() => {
    return actionsApi.run({
      actionName: "ActivityReport"
    });
  }).then(() => {
    todaysAgenda("\n---\n\nAnd here’s your agenda for today:");
  });
} else {
  todaysAgenda(`${greetingText}\n\nHere’s your agenda for today:`);
}

function todaysAgenda(introText) {
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
      heading: `${introText}\n\n**${heading}**`,
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
