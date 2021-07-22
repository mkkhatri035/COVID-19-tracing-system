var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mysql = require('mysql');

var dbConnectionPool = mysql.createPool({
    host: 'localhost',
    database: 'covidtracker',
    multipleStatements: true
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var venueRouter = require('./routes/venueowner');
var adminRouter = require('./routes/admin');
var app = express();
app.use(function(req, res, next) {
    req.pool = dbConnectionPool;
    next();
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'covid-tracker-ses-login',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', usersRouter);
app.use('/users', express.static(path.join(__dirname, 'loggedin/user')));
app.use('/venueowner', venueRouter);
app.use('/venueowner', express.static(path.join(__dirname, 'loggedin/venue owner')));
app.use('/admin', adminRouter);
app.use('/admin', express.static(path.join(__dirname, 'loggedin/admin')));


module.exports = app;
