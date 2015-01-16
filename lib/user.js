'use strict';

module.exports = function() {
  var roleArray = ['You are a Spy', 'You are Loyal to the Cause'];
  var maxSpy = 2;
  var userIndex = 0;
  var role, spy = 0, loyal = 0;

  //user constructor
  var User = function(username, id) {
      this.name = username;
      this.id = id;
  };

  return {
    //makes new user object
    addNew: function(username) {
      var user = new User(username, userIndex);
      //temporary; for debugging
      console.log('New user added: username: %s, id: %d', username, userIndex);
      userIndex++;
      return user;
    },
    //randomly chooses role for user
    addRole: function(user) {
      var newRole = 0;
      if (spy + loyal < userIndex - maxSpy) {
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
      user.role = role;

      return user.role;
    }
  };
};
