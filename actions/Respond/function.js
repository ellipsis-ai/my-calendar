function(eventId, comment, responseStatus, ellipsis) {
  const callib = require('callib');
const constants = require('response-constants');
const name = ellipsis.userInfo.fullName;
const moment = require('moment-timezone');

getEvent();

function getEvent() {
  callib.getEvent(ellipsis, eventId, (event) => {
    const eventEnd = event.end;
    const eventEndTime = eventEnd && eventEnd.dateTime ? moment(eventEnd.dateTime) : null;
    if (eventEndTime && eventEndTime.isAfter()) {
      respondTo(event);
    } else {
      ellipsis.success("Sorry, this event has already ended.");
    }
  });
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
          name: "eventId",
          value: eventId
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
          name: "eventID",
          value: eventId
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
          name: "eventId",
          value: eventId
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
          name: "eventId",
          value: eventId
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
