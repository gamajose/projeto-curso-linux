const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, courseController.getAllCourses);

module.exports = router;