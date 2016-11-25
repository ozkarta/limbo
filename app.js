var express = require('express');

var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressLayouts=require('express-ejs-layouts');

//var helmet=require('helmet');



var routes = require('./routes/index');

var passport = require('passport');
var expressSession = require('express-session');

var RedisStore = require('connect-redis')(expressSession);
var store=new RedisStore({
    host: 'localhost',
    port: 6379,
    db: 2,
    pass: 'RedisPASS'
  })

//var store  = new expressSession.MemoryStore;



var app =express();

var appName='LIMBO';
var  port=2029;





var io=undefined;
//var io=require('socket.io')(server);
var server=app.listen(port,function(){
  console.log(appName+' is listening to  '+port);
});

var WebSocketServer = require('ws').Server;
var wss = WebSocketServer({ server: server });




app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLayouts);


app.use(expressSession(
{
  store: store,
  secret: 'limbo_secret_keyword'
}

));
app.use(passport.initialize());
app.use(passport.session());

//app.use(helmet());
//app.use('/users', users);

var myRouter=new routes.myRouter(app,passport,io,wss,store);
app.use('/', myRouter.router);
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
   console.dir(err);
    //console.log(err.message);
    //console.log(err);
    res.status(err.status || 500);
    res.render('./error/error.ejs', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {

   res.status(err.status || 500);

    res.render('./error/error.ejs', {
      message: err.message,
      error: err
    });
});





//app.set('layout','layouts/layoutMainPage.ejs');



module.exports = app;
