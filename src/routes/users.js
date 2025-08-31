const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/me', authenticateToken, userController.getMe);

router.put('/me', authenticateToken, upload.single('avatar'), userController.updateMe);

router.post('/change-password', authenticateToken, userController.changePassword);

router.get('/me/badges', authenticateToken, userController.getUserBadges);
router.get('/me/certificates', authenticateToken, userController.getUserCertificates);

module.exports = router;