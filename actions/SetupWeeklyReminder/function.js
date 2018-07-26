function(calendar, filter, when, ellipsis) {
  const EllipsisApi = ellipsis.require("ellipsis-api@0.1.1");
const api = new EllipsisApi(ellipsis).actions;
const moment = require('moment-timezone');
moment.tz.setDefault(ellipsis.userInfo.timeZone || ellipsis.teamInfo.timeZone);

api.unschedule({
  actionName: "WeeklyReminder",
  channel: ellipsis.userInfo.messageInfo.channel,
  userId: ellipsis.userInfo.ellipsisUserId
}).then((r) => {
  return api.schedule({
    actionName: "WeeklyReminder",
    args: [{
      name: "calendar",
      value: calendar.id
    }, {
      name: "filterOriginal",
      value: filter
    }],
    channel: ellipsis.userInfo.messageInfo.channel,
    recurrence: when
  }).then((r) => {
    const recurrenceText = r.scheduled.recurrence;
    const nextRecurrence = r.scheduled.firstRecurrence;
    const calendarNameText = calendar.label.trim();
    const successMessage = `OK! I’ll show you the events with “${filter}” on the **${calendarNameText}** calendar ${recurrenceText} in this channel${
        nextRecurrence ? `, starting ${moment(nextRecurrence).format("dddd, MMMM D LT")}` : ""
      }.`;
    ellipsis.success(successMessage + "\n\nTo change these settings, say “setup weekly reminder” again." );
  });
});
}
