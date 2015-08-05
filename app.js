var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//define connection information to mongodb
//either the MONGOLAB_URI environment variable from heroku or the local
var mongouri = process.env.MONGOLAB_URI || 'localhost:27017/th-warehouse'
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongouri);

//import local modules for dynamic web resources
var routes = require('./routes/index');
var users = require('./routes/users');
var warehouse = require('./routes/warehouse');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//pass db connection into app
//not really certain how next() is working, but just going with it
//must look up express docs to understand better
app.use(function(req,res,next){
  req.db = db;
  next();
});

//define actual uri paths for local web resource modules
app.use('/', routes);
app.use('/users', users);
app.use('/warehouse', warehouse);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
