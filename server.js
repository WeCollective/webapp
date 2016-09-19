'use strict';

// REQUIRE MODULES
var express    = require('express');          // call express
var app        = express();                   // define our app using express
var helmet = require('helmet');               // protect against common web vulnerabilities

// SET ENVIRONMENT AND PORT
var env = (process.env.NODE_ENV || 'development');
var port = process.env.PORT || 80;

// MIDDLEWARE
app.use(helmet());

// SERVE THE NODE MODULES FOLDER
app.use('/dependencies/node', express.static(__dirname + '/node_modules'));

// SERVE THE ANGULAR APPLICATION
app.use('/', express.static(__dirname + '/public'));

// Send the index.html for other files to support HTML5Mode
app.all('/*', function(req, res, next) {
  res.sendFile('index.html', { root: __dirname + '/public' });
});

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
