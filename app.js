/******************************
 * SYSTEM INCLUDES
 ******************************/
var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');

/******************************
 * SETUP EXPRESS
 ******************************/
var app = express();
app.set('port', process.env.PORT || 5000);
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'files')));

/******************************
 * ROUTES
 ******************************/
app.get('/', function(req, res) {
	res.resndFile('/views/index.html');
});

/******************************
 * SERVER OPEN
 ******************************/
var httpServer = http.createServer(app);

httpServer.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
