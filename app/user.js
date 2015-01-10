'use strict';

module.exports = function() {
  var roleArray = ['You are a Spy', 'You are Loyal to the Cause'];
  var maxSpy = 1;
  var maxLoyal = 1;
  var role, spy = 0, loyal = 0;

  var User = function(username) {
      this.name = username;
  };

  return { 

    addNew : function(username) {
      var user = new User(username, role);

      return user;
    },

    addRole: function(username) {
      if (spy < maxSpy && loyal < maxLoyal) {
        role = roleArray[Math.round(Math.random())];
        if (role === 'spy') spy++;
        if (role === 'loyal') loyal++;
      } else if (loyal >= 1) {
        role = roleArray[0];
        spy++;
      } else {
        role = roleArray[1];
        loyal++;
      }
      username.role = role;
      return username.role;

    }
  };

};
