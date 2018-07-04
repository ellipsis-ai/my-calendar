function(customNote, events, responseStatus, ellipsis) {
  ellipsis.success("Got it.", {
  next: {
    actionName: "Respond",
    args: [{
      name: "events",
      value: events
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
