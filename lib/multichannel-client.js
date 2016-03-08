var sjsc = require('sockjs-client-ws');

var EventManager = function () {
  this._listeners = {};
};
EventManager.prototype._ensure = function (type) {
  if (!(type in this._listeners)) this._listeners[type] = [];
};
EventManager.prototype.on = function (type, listener) {
  this._ensure(type);
  this._listeners[type].push(listener);
};
EventManager.prototype.emit = function (type) {
  this._ensure(type);
  var args = Array.prototype.slice.call(arguments, 1);
  if (this['on' + type]) this['on' + type].apply(this, args);
  for (var i = 0; i < this._listeners[type].length; i++) {
    this._listeners[type][i].apply(this, args);
  }
};

var WebSocketMultichannel = function (url) {
  if (!url || url.length == 0) {
    throw 'You must supply an url to socket server';
  }

  var ws = null;
  try {
    ws = sjsc.create(url);
  } catch (err) {
    throw err;
  }

  var that = this;
  this.ws = ws;
  this.channels = {};
  this.ws.on('data', function (e) {
    var t = e.split(',');
    var type = t.shift(),
      name = t.shift(),
      payload = t.join();
    if (!(name in that.channels)) {
      return;
    }
    var sub = that.channels[name];

    switch (type) {
      case 'uns':
        delete that.channels[name];
        sub.emit('close', {});
        break;
      case 'msg':
        sub.emit('message', {
          data: payload
        });
        break;
    }
  });
};
WebSocketMultichannel.prototype.channel = function (raw_name) {
  return this.channels[escape(raw_name)] =
    new Channel(this.ws, escape(raw_name), this.channels);
};
exports = module.exports = WebSocketMultichannel;

var Channel = function (ws, name, channels) {
  EventManager.call(this);
  var that = this;
  this.ws = ws;
  this.name = name;
  this.channels = channels;
  var onopen = function () {
    that.ws.send('sub,' + that.name);
    that.emit('open');
  };
  if (ws.readyState > 0) {
    setTimeout(onopen, 0);
  } else {
    this.ws.on('connection', onopen);
  }
};
Channel.prototype = new EventManager();

Channel.prototype.send = function (data) {
  this.ws.send('msg,' + this.name + ',' + data);
};
Channel.prototype.close = function () {
  var that = this;
  this.ws.send('uns,' + this.name);
  delete this.channels[this.name];
  setTimeout(function () {
    that.emit('close', {});
  }, 0);
};
