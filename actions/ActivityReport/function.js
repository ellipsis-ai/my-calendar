function(ellipsis) {
  const moment = require('moment-timezone');
const Formatter = ellipsis.require('ellipsis-cal-date-format@0.0.14');
const eventlib = require('eventlib');
const calLib = require('callib');
const Activity = require('activity');
const inspect = require('util').inspect;
let calTz, now, min, max;

calLib.listPrimaryCal(ellipsis, (tz) => {
  calTz = tz;
  moment.tz.setDefault(calTz);
  now = moment();
  const rewindAmount = now.isoWeekday() > 6 ? 0 : 1;
  min = now.clone().startOf('day').startOf('isoWeek').subtract(rewindAmount, 'week');
  max = min.clone().add(1, 'week');
  return {
    min: min.toISOString(),
    max: max.toISOString()
  };
}, (resultItems) => {
  const items = eventlib.filterDeclined(resultItems);
  const activity = items.reduce(measureItem, new Activity());
  const firstDay = min.format("dddd, MMMM D");
  const lastDay = max.clone().subtract(1, 'hour').format("dddd, MMMM D");
  ellipsis.success(`
Here is your report for ${firstDay} to ${lastDay}.

**${formatHeading(activity)}**

${formatActivity(activity)}
`);
});

function measureItem(activity, item) {
  const otherParticipantCount = item.attendees ? item.attendees.filter((ea) => !ea.self).length : 0;
  if (otherParticipantCount > 0) {
    const start = item.start.dateTime;
    const end = item.end.dateTime;
    if (start && end) {
      const length = moment(end).diff(moment(start), 'minutes');
      if (otherParticipantCount > 1) {
        activity.groupMeetingCount += 1;
        activity.minutesInGroups += length;        
      } else {
        activity.oneOnOneMeetingCount += 1;
        activity.minutesInOneOnOnes += length;
      }
    }
  }
  activity.eventCount += 1;
  return activity;
}

function formatHeading(activity) {
  if (activity.eventCount === 0) {
    return "You had no events on your calendar during this period.";
  } else if (activity.eventCount === 1) {
    return "You had one event on your calendar during this period.";
  } else {
    return `You had ${activity.eventCount} events on your calendar during this period.`;
  }
}

function formatActivity(activity) {
  if (activity.eventCount === 0) {
    return "";
  } else if (activity.eventCount === 1) {
    if (activity.groupMeetingCount > 0) {
      return `It was a group meeting that lasted ${formatMinutes(activity.minutesInGroups)}.`
    } else if (activity.oneOnOneMeetingCount > 0) {
      return `It was a one-on-one meeting that lasted ${formatMinutes(activity.minutesInOneOnOnes)}.`
    } else {
      return "It was not a meeting."
    }
  } else {
    const list = [];
    if (activity.groupMeetingCount === 1) {
      list.push(`There was one group meeting that lasted ${formatMinutes(activity.minutesInGroups)}`);
    } else if (activity.groupMeetingCount > 1) {
      list.push(`There were ${activity.groupMeetingCount} group meetings that lasted a total of ${formatMinutes(activity.minutesInGroups)}`);
    }
    
    if (activity.oneOnOneMeetingCount === 1) {
      list.push(`There was a one-on-one that lasted ${formatMinutes(activity.minutesInOneOnOnes)}`);
    } else if (activity.oneOnOneMeetingCount > 1) {
      list.push(`There were ${activity.oneOnOneMeetingCount} one-on-ones that lasted a total of ${formatMinutes(activity.minutesInOneOnOnes)}`);
    }
    
    if (list.length > 0) {
      return "\n\n" + list.map((ea) => "- " + ea).join("\n");
    } else if (activity.eventCount === 2) {
      return "Neither event was a meeting.";
    } else {
      return "None of the events were meetings.";
    }
  }
}

function formatMinutes(count) {
  return `${count} ${count === 1 ? "minute" : "minutes"}`;
}
}
