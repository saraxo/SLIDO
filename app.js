var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const upload =require('express-fileupload')
const session=require('express-session');
const flash=require("express-flash");
const jwt=require('jsonwebtoken');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter=require('./routes/admin');
var predavacRouter=require('./routes/predavac');
var registerRouter=require('./routes/register');
var loginRouter=require('./routes/login');
var publikaRouter=require('./routes/publika');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('balaton'));
app.use(cookieParser());
app.use(upload());
app.use(session({
  secret:'balaton',
  cookie:{maxAge:86400},
  saveUninitialized:false,
  resave:false,
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/publika',publikaRouter);
app.use('/register',registerRouter)
app.use('/login',loginRouter);

const otvoreneRute=['/','/publika','/register','/register/novi-korisnik','/login'];
app.use((req, res, next) => {
  if (otvoreneRute.includes(req.url) || req.url.includes('/register/') || req.url.includes('/login/')|| req.url.includes('/publika/'))
    return next()
  try {
    jwt.verify(req.cookies.korisnik_token, 'balaton')
  } catch (err) {
    console.log(err)
    res.redirect('/')
    return next()
  }
  next()
})

app.use((req, res, next) => {
  if (!req.cookies.korisnik_token || otvoreneRute.includes(req.url)
      || req.url.includes('/register/') || req.url.includes('/publika/') || req.url.includes('/login/'))
    return next()
  if (req.url.includes('/admin/') && req.cookies.korisnik.tip_korisnika === 'admin')
    return next()
  if ((req.url.includes('/predavac/') && req.cookies.korisnik.tip_korisnika === 'predavac'))
    return next()
  return res.redirect('back')
})

app.use('/users', usersRouter);
app.use('/admin',adminRouter);
app.use('/predavac',predavacRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
