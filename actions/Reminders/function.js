function(ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.1.0');
const eventlib = require('eventlib');
const callib = require('callib');
let now, min, max, calTz;

callib.listPrimaryCal(ellipsis, (tz) => {
  calTz = tz;
  moment.tz.setDefault(calTz);
  now = moment();
  min = now.clone().startOf('minute').add(5, 'minutes');
  max = min.clone().add(5, 'minutes');
  return {
    min: min.toISOString(),
    max: max.toISOString()
  };
}, (resultItems) => {
  const items = eventlib.filterDeclined(resultItems.filter((ea) => {
    return ellipsis.event.originalEventType !== 'scheduled' || moment(ea.start.dateTime).isSameOrAfter(min)
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
    const eventsWithOtherAttendees = items.filter((item) => item.attendees && item.attendees.some((attendee) => !attendee.self));
    const result = {
      hasItems: true,
      heading: items.length > 1 ?
        `Reminder: there are ${items.length} events on your calendar.` :
        `Reminder: there’s an event on your calendar.`,
      items: items.map((event) => {
        return Object.assign({}, event, {
          formattedEvent: Formatter.formatEvent(event, calTz, now.format(Formatter.formats.YMD), { details: true })
        });
      })
    };
    let options;
    if (eventsWithOtherAttendees.length > 0) {
      options = {
        choices: [{
          label: "📣 Running late",
          actionName: "Respond",
          args: [{
            name: "events",
            value: JSON.stringify(items)
          }, {
            name: "comment",
            value: "Sorry, I'm running late"
          }, {
            name: "responseStatus",
            value: "accepted"
          }]
        }, {
          label: "❌ Decline",
          actionName: "Respond",
          args: [{
            name: "events",
            value: JSON.stringify(items)
          }, {
            name: "comment",
            value: ""
          }, {
            name: "responseStatus",
            value: "declined"
          }]
        },  {
          label: "❌ Decline with note",
          actionName: "RespondWithComment",
          args: [{
            name: "events",
            value: JSON.stringify(items)
          }, {
            name: "responseStatus",
            value: "declined"
          }]
        }]
      };
    }
    ellipsis.success(result, options);
  }  
});
}
