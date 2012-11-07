var express = require('express'),
  http = require('http'),
  app = express(),
  server = http.createServer(app),
  io = require('socket.io').listen(server),
  stylus = require('stylus'),
  nib = require('nib'),
  routes = require('./routes');

// Configuration
function compileCss(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon())
  app.use(express.logger("dev"))
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(stylus.middleware(
    { src: __dirname + '/public'
      , compile: compileCss
    }
  ))
  app.use(express.static(__dirname + '/public'));
  app.use(function(req, res, next){
    throw new Error(req.url + ' not found');
  });
  app.use(function(err, req, res, next) {
    console.log(err);
    res.send(err.message);
  });
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

// Routes

var port = process.env.PORT || 5000; // Use the port that Heroku provides or default to 5000
server.listen(port);

var router = require("./router.js");
router.createRoutes(app, routes)

var status = "All is well.";

io.sockets.on('connection', function (socket) {
  io.sockets.emit('status', { status: status }); // note the use of io.sockets to emit but socket.on to listen
  socket.on('reset', function (data) {
    status = "War is imminent!";
    io.sockets.emit('status', { status: status });
  });
});