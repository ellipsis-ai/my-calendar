function(customNote, eventId, responseStatus, ellipsis) {
  ellipsis.success("Got it.", {
  next: {
    actionName: "Respond",
    args: [{
      name: "eventId",
      value: eventId
    }, {
      name: "comment",
      value: customNote
    }, {
      name: "responseStatus",
      value: responseStatus
    }]
  }
});
}
