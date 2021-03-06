"use strict";

// Client implements a simple WebSocket client to talk to the godrone firmware.
// It automatically attempts to reconnect when errors occur.
window.Client = (function() {
  var Client= function Client(options) {
    // websocket url, e.g. ws://...
    this._url = options.url;

    // events
    this._onConnecting = options.onConnecting;
    this._onConnect = options.onConnect;
    this._onError = options.onError;
    this._onClose = options.onClose;
    this._onData = options.onData;
    
    // websocket object
    this._ws = null;

    // time to wait before attempting to reconnect
    this._reconnectTimeout = options.reconnectTimeout || 1000;
  }

  Client.prototype.connect = function() {
    var self = this;
    self._onConnecting();
    self._ws = new WebSocket(self._url);
    self._ws.onopen = function(e) {
      self._onConnect();
    };
    self._ws.onmessage = function(msg) {
      try { 
        var data = JSON.parse(msg.data);
      } catch (err) {
        self._onError(err);
        return;
      }
      self._onData(data);
    };
    self._ws.onerror = function(e) {
      self._onError(e);
    };
    self._ws.onclose = function(e) {
      self._onClose(e);
      setTimeout(function() {
        self.connect();
      }, self._reconnectTimeout);
    };
  };

  Client.prototype.send = function(data) {
    this._conn.send(JSON.stringify(data));
  };

  return Client;
})();
