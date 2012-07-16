
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  
  , home = require('./routes/home.js')
  , data = require('./routes/data.js');

var app = express();

var ejs = require('ejs');

// Prevent conflict with client-side _.templates
ejs.open = '{{';
ejs.close = '}}';

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', home.index);
app.get('/data', data.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
