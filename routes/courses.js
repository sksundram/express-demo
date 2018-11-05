const express = require('express');
const Joi = require('joi');

const router = express.Router();

const courses = [
  { id: 1, name: 'CSE' },
  { id: 2, name: 'Mechanical' },
  { id: 3, name: 'Civil' }
];

router.get('/', (req, res) => {
  res.json(courses);
});

router.get('/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ err: 'Course not found' });
  res.send(course);
});

router.post('/', (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const course = {
    id: courses.length + 1,
    name: req.body.name
  };
  courses.push(course);
  res.send(course);
});

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
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

module.exports = router;
