'use strict';

module.exports = function() {
  var roleArray = ['You are a Spy', 'You are Loyal to the Cause'];
  var maxSpy = 2;
  var userCount = 0;
  var role, spy = 0, loyal = 0;

  //user constructor
  var User = function(username) {
      this.name = username;
  };

  return {
    //makes new user object
    addNew: function(username) {
      var user = new User(username);
      userCount++;
      return user;
    },
    //randomly chooses role for user
    addRole: function(username) {
      var newRole = 0;
      if (spy + loyal < userCount - maxSpy) {
        newRole = spy == maxSpy ? 1 : Math.round(Math.random());
      } else {
        newRole = spy == maxSpy ? 1 : 0;
      }

      role = roleArray[newRole];
      if (newRole === 0) {
        spy++ ;
      } else {
        loyal++;
      }

      username.role = role;

      console.log('Current user count: ' + userCount);

      return username.role;
    }
  };

};
