'use strict';

// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var user = require('./lib/user')();
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// users which are currently connected to the chat

var usernames = [];
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
    usernames.push(user.addNew(username));

    addedUser = true;
    socket.emit('login', {
      users: usernames,
      numUsers: usernames.length
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: usernames.length
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
  socket.on('userReady', function() {
    //loops through username array to find user and assign role
      usernames.forEach(function(username) {
        if (socket.username === username.name) {
          socket.emit('new role', user.addRole(username));
        }
      });
      startGame();
  });

  var leader;
  var missionCount = 0;

  function startGame() {
    leader = usernames[Math.round(Math.random * usernames.length)];
    socket.broadcast.emit('leaderSelected', {
      currentLeader: leader,
      currentMission: missionCount,
      users: usernames
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
    if (yeas + nays == usernames.length) {
      if (yeas > nays) {
        socket.broadcast.emit('startMission', {
          currentTeam: team
        });
      } else {
        var nextLeaderIndex = usernames.indexOf(leader) + 1;
        if (nextLeaderIndex == usernames.length) {
          nextLeaderIndex = 0;
        }
        leader = usernames[nextLeaderIndex];
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
    // remove the username from global usernames list
    if (addedUser) {
      usernames.splice(usernames.indexOf(socket.username), 1);

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: usernames.length
      });
    }
  });
});
