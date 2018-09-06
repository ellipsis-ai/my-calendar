function(calendar, filter, daysAhead, when, shouldUnschedule, ellipsis) {
  const EllipsisApi = ellipsis.require("ellipsis-api@0.1.1");
const api = new EllipsisApi(ellipsis).actions;
const moment = require('moment-timezone');
moment.tz.setDefault(ellipsis.userInfo.timeZone || ellipsis.teamInfo.timeZone);

if (shouldUnschedule) {
  api.unschedule({
    actionName: "FutureReminder",
    channel: ellipsis.userInfo.messageInfo.channel
  }).then(doScheduling);
} else {
  doScheduling();
}

function doScheduling() {
  return api.schedule({
    actionName: "FutureReminder",
    args: [{
      name: "calendar",
      value: calendar.id
    }, {
      name: "filterOriginal",
      value: filter
    }, {
      name: "daysAhead",
      value: daysAhead
    }],
    channel: ellipsis.userInfo.messageInfo.channel,
    recurrence: when
  }).then((r) => {
    const recurrenceText = r.scheduled.recurrence;
    const nextRecurrence = r.scheduled.firstRecurrence;
    const calendarNameText = calendar.label.trim();
    const successMessage = `OK! I’ll show you the events with “${filter}” up to ${daysAhead} days in the future on the **${calendarNameText}** calendar ${recurrenceText} in this channel${
        nextRecurrence ? `, starting ${moment(nextRecurrence).format("dddd, MMMM D LT")}` : ""
      }.`;
    ellipsis.success(successMessage + "\n\nTo change these settings, say “setup future reminder” again." );
  });
}
}
