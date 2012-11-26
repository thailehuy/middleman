var express = require('express'),
  http = require('http'),
  app = express(),
  server = http.createServer(app),
  io = require('socket.io').listen(server),
  stylus = require('stylus'),
  nib = require('nib'),
  redis   = require('redis'),
  publisherClient = redis.createClient(),
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

// events
app.get('/update-stream', function(req, res) {
  // let request last as long as possible
  req.socket.setTimeout(Infinity);

  var messageCount = 0;
  var subscriber = redis.createClient();

  subscriber.subscribe("updates");

  // In case we encounter an error...print it out to the console
  subscriber.on("error", function(err) {
    console.log("Redis Error: " + err);
  });

  // When we receive a message from the redis connection
  subscriber.on("message", function(channel, message) {
    messageCount++; // Increment our message count

    res.write('id: ' + messageCount + '\n');
    res.write("data: " + message + '\n\n'); // Note the extra newline
  });

  //send headers for event-stream connection
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  // The 'close' event is fired when a user closes their browser window.
  // In that situation we want to make sure our redis channel subscription
  // is properly shut down to prevent memory leaks...and incorrect subscriber
  // counts to the channel.
  req.on("close", function() {
    subscriber.unsubscribe();
    subscriber.quit();
  });
});

app.get('/fire/:event/:token', function(req, res) {
  publisherClient.publish( 'updates', ('"' + req.params.event + '" page visited') );
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('All clients have received "' + req.params.event + '"');
  res.end();
})