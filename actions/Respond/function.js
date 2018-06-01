function(events, comment, responseStatus, ellipsis) {
  const callib = require('callib');
const constants = require('response-constants');
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
  const newEventDetails = getNewEventDetails(event);
  let response = "OK. ";
  let responseOptions = {};
  if (decliningOwnEvent(event)) {
    newEventDetails.status = "cancelled";
    if (comment) {
      newEventDetails.summary = updateSummaryWithComment(event);
    }
    response += responseForDecliningOwnEvent();
  } else if (lateForOwnEvent(event)) {
    newEventDetails.summary = updateSummaryWithComment(event);
    response += responseForLateForOwnEvent();
    responseOptions = choicesForLate();
  } else if (decliningEvent()) {
    response += responseForDecliningEvent()
    responseOptions = choicesForDecline();
  } else if (lateForEvent()) {
    response += responseForLateForEvent();
    responseOptions = choicesForLate();
  }
  callib.updateEvent(ellipsis, event.id, newEventDetails, (newEvent) => {
    ellipsis.success(response, responseOptions);
  });
}

function decliningEvent() {
  return responseStatus === "declined";
}

function decliningOwnEvent(event) {
  return decliningEvent() && ownEvent(event);
}

function lateForEvent() {
  return responseStatus === "accepted";
}

function lateForOwnEvent(event) {
  return lateForEvent() && ownEvent(event);
}
  
function ownEvent(event) {
  return event.attendees.some((attendee) => attendee.self && attendee.organizer);
}

function getNewEventDetails(event) {
  return Object.assign({}, event, {
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
}

function responseForDecliningOwnEvent() {
  return  "Since you organized this event, it has now been canceled. Others will be notified. " +
    comment ? `I’ve also added your note:

> ${comment}` : "";
}

function responseForLateForOwnEvent() {
  return `I’ve added a note for others:

> ${comment}
`;
}

function responseForDecliningEvent() {
  let response = "I’ve informed the organizer that you will not attend.";
  if (comment) {
    response += `

I’ve also added your note:

> ${comment}`;
  }
  return response;
}

function responseForLateForEvent() {
  return `I’ve sent a note to the organizer:

> ${comment}`;
}

function updateSummaryWithComment(event) {
  const NOTE_PREFIX = " — NOTE: ";
  const oldSummary = event.summary || "";
  const newNote = `${NOTE_PREFIX}${comment}`;
  return oldSummary.replace(new RegExp(`(${NOTE_PREFIX}.+)?$`), newNote);
}

function choicesForDecline() {
  if (!comment) {
    return {
      choices: [{
        label: "Add a custom note",
        actionName: "RespondWithComment",
        args: [{
          name: "events",
          value: events
        }, {
          name: "responseStatus",
          value: "declined"
        }]
      }]
    };
  } else {
    return {};
  }
}

function choicesForLate() {
  if (comment === constants.GENERIC_RUNNING_LATE) {
    return {
      choices: [{
        label: "⏲ 5 minutes late",
        actionName: "Respond",
        args: [{
          name: "events",
          value: events
        }, {
          name: "responseStatus",
          value: "accepted"
        }, {
          name: "comment",
          value: "Running 5 minutes late"
        }]
      }, {
        label: "⏲ 15 minutes late",
        actionName: "Respond",
        args: [{
          name: "events",
          value: events
        }, {
          name: "responseStatus",
          value: "accepted"
        }, {
          name: "comment",
          value: "Running 15 minutes late"
        }]
      }, {
        label: "🖊 Write a custom note",
        actionName: "RespondWithComment",
        args: [{
          name: "events",
          value: events
        }, {
          name: "responseStatus",
          value: "accepted"
        }]
      }]
    };
  } else {
    return {};
  }
}
}
