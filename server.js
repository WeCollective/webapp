'use strict';

// REQUIRE MODULES
var express    = require("express");          // call express
var app        = express();                   // define our app using express

// SET ENVIRONMENT AND PORT
var env = (process.env.NODE_ENV || "development");
var port = process.env.PORT || 8081;

// SERVE THE STATIC ANGULAR APPLICATION
app.use(express.static(__dirname + '/public'));

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
