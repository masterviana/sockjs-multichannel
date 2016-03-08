var multichannelClient = require('../index.js').client;

var multiClient = new multichannelClient("http://localhost:9999/multiplex");

var red = multiClient.channel("red");
var blue = multiClient.channel("blue");

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
listeners(blue,"blue");

setInterval(function(){
    red.send("client : red channel sent this!!");
},1000);

setInterval(function(){
  blue.send("client : blue channel sent this!!");
},2000);
