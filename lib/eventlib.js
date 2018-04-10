/*
@exportId AjtTiS-fTzKYaHsNUUpZqg
*/
module.exports = (function() {
return {
  filterDeclined: function(events) {
    return events.filter((event) => {
      const selfAttend = (event.attendees || []).find((ea) => ea.self);
      const response = selfAttend ? selfAttend.responseStatus : null;
      return response !== "declined";
    });
  }
}

})()
     