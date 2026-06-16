const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/auth');
const manageRoutes = require('./adminContent');
const lessonCommentsRoutes = require('./lessonComments');

router.get('/', authenticateToken, courseController.getAllCourses);
router.use('/manage', manageRoutes);
router.use('/comments', lessonCommentsRoutes);

module.exports = router;
