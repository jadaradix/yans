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

  // Express
  _self.app = express();

  // Compression
  if (options["compression"]) {
    var compression = require("compression");
    _self.app.use(compression());
  }

  // Logging
  if (options["logging"]) {
    var morgan = require("morgan");
    _self.logger = morgan(
      (options["loggingFormat"] ? options["loggingFormat"] : "tiny"),
      {}
    );
    _self.app.use(_self.logger);
  }

  // Static Directories
  if (options["staticDirectories"]) {
    _.each(options["staticDirectories"], function(directory) {
      _self.app.use(
        "/" + directory,
        express.static(options["directory"] + "/" + directory)
      );
    });
  }

  // Generic Configuration
  _self.app.set("view engine", options["viewEngine"] ? options["viewEngine"] : "jade");
  if (options["viewPath"]) {
    _self.app.set("views", options["viewPath"]);
  }

  // Cross Domain Middleware
  if (options["crossdomain"]) {
    var crossDomainMiddleware = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    }
    _self.app.use(crossDomainMiddleware);
  }

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

  // Start
  _self.start = function(callback) {
    var port = options["port"] || (!options["ssl"] ? 80 : 443);
    var whatToListenTo = _self.app;
    if ("ssl" in options) {
      var https = require("https");
      var fs = require("fs");
      var config = {
        key: fs.readFileSync(options.ssl.keyFile),
        cert: fs.readFileSync(options.ssl.certFile),
        ca: fs.readFileSync(options.ssl.caFile),
        requestCert: true,
        rejectUnauthorized: false
      };
      whatToListenTo = https.createServer(config, _self.app);
    }
    whatToListenTo.listen(port, function() {
      callback(null, port);
    });
    whatToListenTo.on("error", function(err) {
      callback(err);
    });
  }

}
