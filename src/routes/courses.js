const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/auth');
const manageRoutes = require('./adminContent');

router.get('/', authenticateToken, courseController.getAllCourses);
router.use('/manage', manageRoutes);

module.exports = router;
