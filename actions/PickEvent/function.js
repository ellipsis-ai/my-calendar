function(events, comment, responseStatus, nextAction, ellipsis) {
  let eventsArray;
try {
  eventsArray = JSON.parse(events);
  if (!Array.isArray(eventsArray)) {
    throw new ellipsis.Error("Non-array JSON object provided.", {
      userMessage: "An invalid list of events was provided."
    });
  }
} catch(e) {
  throw new ellipsis.Error(e, { userMessage: "An invalid list of events was provided." });
}

if (eventsArray.length > 1) {
  ellipsis.success("Which event would you like to respond to?", {
    choices: eventsArray.map((event, index) => ({
      label: event.summary || `Event ${index + 1}`,
      actionName: nextAction,
      args: [{
        name: "eventId",
        value: event.id
      }, {
        name: "comment",
        value: comment
      }, {
        name: "responseStatus",
        value: responseStatus
      }]
    }))
  })
} else if (eventsArray.length === 1) {
  const event = eventsArray[0];
  ellipsis.success("OK…", {
    nextAction: {
      actionName: nextAction,
      args: [{
        name: "eventId",
        value: event.id
      }, {
        name: "comment",
        value: comment
      }, {
        name: "responseStatus",
        value: responseStatus
      }]
    }
  });
} else {
  ellipsis.success("No event was provided to respond to.");
}
}
