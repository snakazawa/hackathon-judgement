var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var mongoose = require('mongoose');
var mongo = require('connect-mongo');
var config = require('config');

var app = express();

// mongoose
if (app.get('env') !== 'test') {
    mongoose.connect(config.mongo.url);
}

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the GitHubStrategy within Passport.
passport.use(new GitHubStrategy({
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL,
        scope: ['user', 'repo']
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            profile.token = accessToken;
            return done(null, profile);
        });
    }
));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: config.session.name,
    secret: config.session.secret,
    store: new (mongo(session))({
        url: config.mongo.url
    }),
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// routing
var index = require('./routes/index');
var contents = require('./routes/contents');
var admin = require('./routes/admin');
var api = require('./routes/api');
var auth = require('./routes/auth')(passport);

app.use('/', index);
app.use('/auth', auth);
app.use('/', auth.ensureAuthenticated, contents);
app.use('/admin', auth.ensureAuthenticated, auth.validateAdmin, admin);
app.use('/api', auth.ensureAuthenticated, auth.validateAdmin, api);

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

