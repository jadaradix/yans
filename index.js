/*
 * yans
 * Copyright(c) 2015 James Garner
 * MIT Licensed
*/

var express = require("express");
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
  _self.start = function() {
    var port = options["port"] || 80;
    _self.app.listen(port);
    return port;
    // return 0;
  }

}