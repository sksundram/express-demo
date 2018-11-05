const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const courses = require('./routes/courses');
const home = require('./routes/home');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');

// In the terminal run export DEBUG=app:startup that will show debugging messages that are part of app:startup namespace
// To reset, run export DEBUG=
// To show debugging messages from multiple namespaces
// run export DEBUG=app:startup,app:db
// or use a wild card, export DEBUG=app:*
// To run at runtime, DEBUG=app:db nodemon index.js

const app = express();

// console.log(process.env.NODE_ENV);
// console.log(app.get('env'));

// Set the templating engine to pug
app.set('view engine', 'pug');
// Optional setting to override the default path to the templates
app.set('views', './views'); // default location

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());

app.use('/api/courses', courses);
app.use('/', home);

// Configuration
console.log(`Application Name: ${config.get('name')}`);
console.log(`Mail Server: ${config.get('mail.host')}`);
console.log(`Mail Password: ${config.get('mail.password')}`);

if (app.get('env') === 'development') {
  app.use(morgan('dev'));
  startupDebugger('Morgan enabled...');
}

// DB work...
dbDebugger('Connected to the database...');

app.use(function(req, res, next) {
  console.log('Logging..');
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
