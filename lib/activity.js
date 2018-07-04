/*
@exportId 51quEGAlQK6YrHBCvZPDRA
*/
module.exports = (function() {
class Activity {
  constructor(props) {
    this.oneOnOneMeetingCount = props && props.oneOnOneMeetingCount || 0;
    this.minutesInOneOnOnes = props && props.minutesInOneOnOnes || 0;
    this.groupMeetingCount = props && props.groupMeetingCount || 0;
    this.minutesInGroups = props && props.minutesInGroups || 0;
    this.eventCount = props && props.eventCount || 0;
    this.participants = props && props.participants || [];
  }
  
  meetingCount() {
    return this.oneOnOneMeetingCount + this.groupMeetingCount;
  }
  
  minutesInMeetings() {
    return this.minutesInOneOnOnes + this.minutesInGroups;
  }
  
  getParticipantCount() {
    const emails = this.participants.map((ea) => ea.id || ea.email);
    const uniques = new Set(emails);
    return uniques.size;
  }
}

return Activity;
})()
     