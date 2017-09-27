var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

app.use(express.static('client'));

var io = require('socket.io')(server);

function isQuestion(msg) {
  return msg.match(/\?$/)
}

function askingTime(msg) {
  return msg.match(/time/i)
}

function askingTemp(msg) {
  return msg.match(/temperature/i)
}

function getWeather(callback) {
  var request = require('request');
  request.get("https://www.metaweather.com/api/location/4118/", function (error, response) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(response.body);
      callback(data.consolidated_weather[0].the_temp);
    }
  })
}

io.on('connection', function (socket) {

  socket.on('message', function (msg) {
    // you can save the messages in an array here to display the history
    console.log('Received Message: ', msg);
    // console.log('Is this message a question?', isQuestion(msg));
    // console.log('Is this message about time?', askingTime(msg));
    if (!isQuestion(msg)) {
      io.emit('message', msg);
    } else if (askingTime(msg)) {
      io.emit('message', new Date);
    } else if (askingTemp(msg)) {
      getWeather(function(the_temp) {
      io.emit('message', 'Temperature now is ' + the_temp)
    })
    } else {
      io.emit('message',msg);
    }
  });
});

server.listen(8080, function() {
  console.log('Chat server running');
});
