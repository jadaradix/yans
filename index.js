/*!
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

  // Boot
  var port = options["port"] || 80;
  _self.app.listen(port, function() {
    console.log("Hi. Server is running on port %d!", port);
    console.log();
  });

}