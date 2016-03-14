## Sockjs Multichannel
===================

[![NPM](https://nodei.co/npm/sockjs-multichannel.png)](https://nodei.co/npm/sockjs-multichannel/)

**sockjs-multichannel** is a small library on top of SockJS that allows
you to create channels (multiplex) over a single SockJS connection also have the ability to create server and client in node instead only in browsers. 
It's created based on library [websocket-multiplex](https://github.com/sockjs/websocket-multiplex)

To learn more about the problem of multiplexing channels in a single connection please read more [here](https://www.rabbitmq.com/blog/2012/02/23/how-to-compose-apps-using-websockets/)


### How to use 
===================

### Create server and register one channel

```javascript
var http                = require('http');
var express             = require('express');
var sockjs              = require('sockjs');
var multichannelServer = require('sockjs-multichannel').server;

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
var app    = express();
var server = http.createServer(app);

service.installHandlers(server, {prefix:'/multiplex'});
console.log(' [*] Listening on 0.0.0.0:9999' );
server.listen(9999, '0.0.0.0');
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


```

### Create a client in node

```javascript
var multichannelClient = require('sockjs-multichannel').client;

var multiClient = new multichannelClient("http://localhost:9999/multiplex");

var red = multiClient.channel("red");

function listeners(channel,name){
  channel.on("open",function(){
    console.log("OPEN Channel ",name);
  });
  channel.on("close",function(){
    console.log("CLOSE Channel ",name);
  });
  channel.on("message",function(message){
      console.log("DATA from  Channel ",name, " data : ",message);
  });
}

listeners(red,"red");

setInterval(function(){
    red.send("client : red channel sent this!!");
},1000);
```

See a more detailed examples [here](https://github.com/masterviana/sockjs-multichannel/tree/master/examples)


I hope it's useful!
