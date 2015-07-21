/*
 * yans
 * Copyright(c) 2015 James Garner
 * MIT Licensed
*/

var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

module.exports = function yans(options) {

  var _self = this;
  _self._options = options;

  // Express
  _self.app = express();

  // Compression
  if (_self._options["compression"]) {
    var compression = require("compression");
    _self.app.use(compression());
  }

  // Logging
  if (_self._options["logging"]) {
    var morgan = require("morgan");
    _self.logger = morgan(
      (_self._options["loggingFormat"] ? _self._options["loggingFormat"] : "tiny"),
      {}
    );
    _self.app.use(_self.logger);
  }

  // Static Directories
  if (_self._options["staticDirectories"]) {
    _.each(_self._options["staticDirectories"], function(directory) {
      _self.app.use(
        "/" + directory,
        express.static(_self._options["directory"] + "/" + directory)
      );
    });
  }

  // Generic Configuration
  _self.app.set("view engine", _self._options["viewEngine"] ? _self._options["viewEngine"] : "jade");
  if (_self._options["viewPath"]) {
    _self.app.set("views", _self._options["viewPath"]);
  }

  // Cross Domain Middleware
  if (_self._options["crossDomain"] || _self._options["crossdomain"]) {
    var crossDomainMiddleware = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    }
    _self.app.use(crossDomainMiddleware);
  }

  _self.app.use(bodyParser.json());
  _self.app.use(bodyParser.urlencoded({
    "extended": true
  }));

  // Helpers
  _self.jsonError = function(text, res) {
    res.send({
      "status": "error",
      "data": text
    });
  };

  _self.jsonSuccess = function(text, res) {
    res.send({
      "status": "ok",
      "data": text
    });
  };

  //Set Option helper
  _self.setOption = function(name, value) {
    _self._options[name] = value;
  }

  //Delete Option helper
  _self.deleteOption = function(name, value) {
    delete _self._options[name];
  }

  // Start
  _self.start = function(callback) {
    var port = _self._options["port"] || (!_self._options["ssl"] ? 80 : 443);
    var listeners = [_self.app];
    if ("ssl" in _self._options) {
      var https = require("https");
      var fs = require("fs");
      var config = {
        key: fs.readFileSync(_self._options.ssl.keyFile),
        cert: fs.readFileSync(_self._options.ssl.certFile),
        ca: fs.readFileSync(_self._options.ssl.caFile),
        requestCert: true,
        rejectUnauthorized: false
      };
      listeners[0] = https.createServer(config, listeners[0]);
      if ("httpRedirect" in _self._options.ssl) {
        var httpListener = express();
        httpListener.yansPort = 80;
        httpListener.all("*", function(req, res) {
          res.redirect(301, "https://" + req.headers.host + req.url);
        });
        listeners.push(httpListener);
      }
    }
    listeners[0].yansPort = port;
    _.each(listeners, function(listener) {
      listener.listen(listener.yansPort, function() {
        callback(null, listener.yansPort);
      });
      listener.on("error", function(err) {
        callback(err);
      });
    });
  }

}
