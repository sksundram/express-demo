const express = require('express');
const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
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

const courses = [
  { id: 1, name: 'CSE' },
  { id: 2, name: 'Mechanical' },
  { id: 3, name: 'Civil' }
];

app.get('/', (req, res) => {
  res.render('index', {
    title: 'My Express App',
    message: 'Hello'
  });
});

app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ err: 'Course not found' });
  res.send(course);
});

app.post('/api/courses', (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const course = {
    id: courses.length + 1,
    name: req.body.name
  };
  courses.push(course);
  res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
  // Look up the course
  const course = courses.find(c => c.id === parseInt(req.params.id));
  // If not existing, return 404
  if (!course) return res.status(404).json({ err: 'Course not found' });

  // Validate
  const { error } = validateCourse(req.body);
  // If invalid, return 400 - Bad request
  if (error) return res.status(400).send(error.details[0].message);

  // Update course
  course.name = req.body.name;
  // Return the updated course
  res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
  // Look up the course
  const course = courses.find(c => c.id === parseInt(req.params.id));
  // If not existing, return 404
  if (!course) return res.status(404).json({ err: 'Course not found' });

  // Delete
  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

function validateCourse(course) {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  return Joi.validate(course, schema);
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
