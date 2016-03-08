var http                = require('http');
var express             = require('express');
var sockjs              = require('sockjs');
var multichannelServer = require('../index.js').server;

var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var service = sockjs.createServer(sockjs_opts);

var multiplexer = new multichannelServer(service);

var red = multiplexer.registerChannel('red');
red.on('connection', function(conn) {
    conn.write('Red is conncted');
    conn.on('data', function(data) {
        conn.write('server : red says ' + data);
    });
});


/*
  Broadcast messages for blue channels!
  Each one are subscribe the channel bue will receive message
*/
var connPush = []
var blue = multiplexer.registerChannel('blue');
blue.on('connection', function(conn) {
   connPush.push(conn);
   for (var i in connPush) {
      var _conn = connPush[i];
    }
    _conn.write('server : blue says hi!');

    conn.on('data', function(data) {
      for (var i in connPush) {
         var _conn = connPush[i];
         _conn.write('server : blue says :  ' + data);
       }
    });
});

var carl = multiplexer.registerChannel('carl');
carl.on('connection', function(conn) {
    conn.write('Carl says goodbye!');
    // Explicitly cancel connection
    conn.end();
});

var app    = express();
var server = http.createServer(app);

service.installHandlers(server, {prefix:'/multiplex'});

console.log(' [*] Listening on 0.0.0.0:9999' );
server.listen(9999, '0.0.0.0');

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
