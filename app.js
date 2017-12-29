var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rest = require('./routes/rest');
var accept = require('./routes/accept');
var process = require('./routes/process');
var finish = require('./routes/finish');
var edit = require('./routes/edit');

var db = require('./db');
var app = express();

//
// db.connect('mongodb://localhost:27017/clipsoft', function (err) {
//     if (err) {
//         console.log('Unable to connect to MongoDB');
//     }
// });
//

db.connect('mongodb://52.79.168.11:27017/clipsoft', function (err) {
    if (err) {
        console.log('Unable to connect to MongoDB');
    }
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/rest', rest);
app.use('/accept', accept);
app.use('/process', process);
app.use('/finish', finish);
app.use('/edit', edit);

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

app.get('/register', function(req, res) {
    res.sendFile('register.html', {root : __dirname + "/public"});
});

app.get('/assign', function(req, res) {
    res.sendFile('assign.html', {root : __dirname + "/public"});
});

app.get('/search', function(req, res) {
    res.sendFile('search.html', {root : __dirname + "/public"});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
