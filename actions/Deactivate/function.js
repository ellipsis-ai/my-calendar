function(ellipsis) {
  const EllipsisApi = ellipsis.require('ellipsis-api');
const api = new EllipsisApi(ellipsis).actions;
api.unschedule({
  actionName: "Agenda",
  channel: ellipsis.userInfo.messageInfo.channel,
  userId: ellipsis.userInfo.ellipsisUserId
}).then(() => {
  return api.unschedule({
    actionName: "Reminders",
    channel: ellipsis.userInfo.messageInfo.channel,
    userId: ellipsis.userInfo.ellipsisUserId
  });
}).then(() => {
  ellipsis.success();
}).catch((err) => {
  throw new ellipsis.Error(err, { userMessage: "I tried to turn off your agenda and calendar reminders, but something went wrong. Try again, or else try unscheduling it manually." });
});
}
