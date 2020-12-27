var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('express-flash-notification');
var session = require('express-session'); 
var moment = require('moment'); 


const db = mongoose.connection;

mongoose.connect("mongodb+srv://thanhthoa:Alice2907%40@nodjesapi.hq6qd.mongodb.net/nodejs_trainiing_2?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}); 
//define path 
global.__base = __dirname + '/';
global.__path_config = __base + "config/"; 
global.__path_routes = __base + "routes/"; 
global.__path_helper = __base + "helper/";
global.__path_schemas = __base + "schemas/";  
global.__path_validates = __base + "validates/";  
global.__path_views = __base + "views/";  
global.__path_public = __base + "public/"; 
global.__path_models = __base + "models/"; 
global.__path_upload = __path_public + "upload/"; 

var indexRouter = require(__path_routes +   'backend/index');
var app = express();

let systemConfig = require(__path_config + 'system'); 
app.use(expressLayouts);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set("layout", "backend"); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//flash messages 

app.use(session({
  name: 'example',
  secret: 'shuush',
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    expires: new Date('Monday, 18 January 2028')
  },
}));
app.use(flash(app));





//local variable 
app.locals.systemConfig = systemConfig; 
//local variable moment
app.locals.moment = moment; 

//setup router 
app.use(`/${systemConfig.prefixAdmin}`, indexRouter);


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
  res.render('error', { title: 'Error Page' });
});

module.exports = app;
