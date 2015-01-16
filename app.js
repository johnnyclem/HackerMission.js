'use strict';

// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var user = require('./lib/user')();
// var game = require('./lib/game')();
// var mission = require('./lib/mission')();
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// users which are currently connected to the chat

var users = [];
var usersWithRoles = 0;
var team = [];
var maxTeamSize = 2;

// var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    users.push(user.addNew(username));

    addedUser = true;
    socket.emit('login', {
      currentUsers: users,
      numUsers: users.length
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: users.length
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user clicks Start Game
  socket.on('userReady', function () {
    //loops through users array to find user and assign role
    users.forEach(function(u) {
      if (socket.username === u.name) {
        socket.emit('new role', user.addRole(u));
        usersWithRoles++;
      }
    });
    // console.log("Users with roles: %d, users.length: %d", usersWithRoles, users.length);
    if (usersWithRoles == users.length) {
      startGame();
    }
  });

  var leader;
  var missionCount = 1;

  function startGame() {
    leader = users[Math.floor(Math.random() * users.length)];
    socket.broadcast.emit('leaderSelected', {
      currentLeader: leader,
      currentMission: missionCount,
      currentUsers: users
    });
  }

  var yeas = 0;
  var nays = 0;

  socket.on('userSelected', function(selectedUser) {
    if (team.length < maxTeamSize) {
      team.push(selectedUser);
    } else {
      team.push(selectedUser);
      yeas++;
      socket.broadcast.emit('teamSelected', {
        currentTeam: team
      });
    }
  });

  socket.on('submitVote', function(shouldGo) {
    if (shouldGo) {
      yeas++;
    } else {
      nays++;
    }
    if (yeas + nays == users.length) {
      if (yeas > nays) {
        socket.broadcast.emit('startMission', {
          currentTeam: team
        });
      } else {
        var nextLeaderIndex = users.indexOf(leader) + 1;
        if (nextLeaderIndex == users.length) {
          nextLeaderIndex = 0;
        }
        leader = users[nextLeaderIndex];
        yeas = 0;
        nays = 0;
        socket.broadcast.emit('leaderSelected', {
          currentLeader: leader
        });
      }
    }
  });

  function startMission() {

  }

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global users list
    if (addedUser) {
      users.splice(users.indexOf(socket.username), 1);

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: users.length
      });
    }
  });
});
