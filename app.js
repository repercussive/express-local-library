const { format } = require('date-fns');
const mongoose = require('mongoose');
const handlebars = require('hbs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');

const app = express();

const devDbUrl = 'mongodb+srv://liam:mongodb@cluster0.z86mb.mongodb.net/local_library?retryWrites=true&w=majority';
const mongoDbUrl = process.env.MONGODB_URI || devDbUrl;
mongoose.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(helmet());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

handlebars.registerHelper('equal', function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.every(expression => args[0].toString() === expression.toString());
});
handlebars.registerHelper('format', date => format(new Date(date), 'MMM dd, yyyy'));
handlebars.registerHelper('formatymd', date => format(new Date(date), 'yyyy-MM-dd'));
handlebars.registerHelper('concat', (...args) => args.slice(0, -1).join(''));

module.exports = app;