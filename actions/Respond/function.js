function(events, comment, responseStatus, ellipsis) {
  const callib = require('callib');
const name = ellipsis.userInfo.fullName;
let eventsArray;
try {
  eventsArray = JSON.parse(events);
  if (!Array.isArray(eventsArray)) {
    throw new Error("Non-array JSON object provided.")
  }
} catch(e) {
  throw new ellipsis.Error(e, { userMessage: "An invalid list of events was provided." });
}

if (eventsArray.length > 1) {
  ellipsis.success("Which event would you like to respond to?", {
    choices: eventsArray.map((event, index) => ({
      label: event.summary || `Event ${index + 1}`,
      actionName: "Respond",
      args: [{
        name: "events",
        value: [event]
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
  respondTo(eventsArray[0]);
} else {
  ellipsis.success("No event was provided to respond to.");
}

function respondTo(event) {
  if (!event.attendees || !event.attendees.some((attendee) => !attendee.self)) {
    ellipsis.success("This event has no other participants.");
    return;
  }
  const newEventDetails = Object.assign({}, event, {
    attendees: event.attendees.map((attendee) => {
      if (!attendee.self) {
        return attendee;
      } else {
        return Object.assign({}, attendee, {
          responseStatus: responseStatus,
          comment: comment || attendee.comment || null
        });
      }
    })
  });
  if (decliningOwnEvent(event)) {
    newEventDetails.status = "cancelled";
  } else if (lateForOwnEvent(event)) {
    newEventDetails.summary = (event.summary || "") + ` — WILL START LATE`;
  }
  callib.updateEvent(ellipsis, event.id, newEventDetails, (newEvent) => {
    ellipsis.success("OK, your response has been sent.")
  });
}

function decliningOwnEvent(event) {
  return responseStatus === "declined" && ownEvent(event);
}

function lateForOwnEvent(event) {
  return responseStatus === "accepted" && /\blate\b/i.test(comment) && ownEvent(event);
}
  
function ownEvent(event) {
  return event.attendees.some((attendee) => attendee.self && attendee.organizer);
}
}
