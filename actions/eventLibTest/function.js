function(ellipsis) {
  const eventlib = require('eventlib');
const test = require('tape');
const moment = require('moment-timezone');
test.onFailure(ellipsis.error);
test.onFinish(() => ellipsis.success("All passed!"));
const groups = eventlib.groupEventsByDay(getEvents(), moment('2018-11-01'), moment('2019-03-01'), 'UTC');
const formatted = eventlib.formatEventsGroupedByDay(groups, "day")
test('groupEventsByDay', (t) => {
  t.deepEqual(groups, [{
    date: "2018-11-05",
    events: ['Extended holidays']
  }, {
    date: "2018-11-06",
    events: ['Extended holidays']
  }, {
    date: "2018-11-07",
    events: ['Extended holidays']
  }, {
    date: "2018-12-26",
    events: ["Boxing Day (regional holiday)"]
  }, {
    date: "2019-01-01",
    events: ["New Year\'s Day", "Ice skating"]
  }, {
    date: "2019-01-02",
    events: ["Ice skating", "Day After New Year’s Day (Quebec)"]
  }, {
    date: "2019-02-02",
    events: ["Groundhog Day"]
  }], "Groups contain the expected events");
  t.end();
});

test('formatEventsGroupedByDay', (t) => {
  t.equal(formatted, 
`**Monday 11/5 to Wednesday 11/7:** Extended holidays

**Wednesday 12/26:** Boxing (regional holiday)

**Tuesday 1/1:** New Year's, Ice skating

**Wednesday 1/2:** Ice skating, After New Year’s Day (Quebec)

**Saturday 2/2:** Groundhog`, "Formatting clusters events as expected");
  t.end();
});

function getEvents() {
  return [
  {
    summary: "Extended holidays",
    start: { date: '2018-11-05' },
    end: { date: '2018-11-08' }
  },
  {
    summary: 'Boxing Day (regional holiday)',
    start: { date: '2018-12-26' },
    end: { date: '2018-12-27' },
  },
  {
    summary: 'New Year\'s Day',
    start: { date: '2019-01-01' },
    end: { date: '2019-01-02' },
  },
  {
    summary: 'Ice skating',
    start: { dateTime: '2019-01-01T10:00:00.000Z' },
    end: { dateTime: '2019-01-02T14:00:00.000Z' }
  },
  {
    summary: 'Day After New Year’s Day (Quebec)',
    description: 'Public holiday in: Quebec',
    start: { date: '2019-01-02' },
    end: { date: '2019-01-03' },
  },
  {
    summary: 'Groundhog Day',
    start: { date: '2019-02-02' },
    end: { date: '2019-02-03' },
  }];
}
}
