const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload'); // <-- Importa o middleware de upload

router.get('/me', authenticateToken, userController.getMe);

router.put('/me', authenticateToken, upload.single('avatar'), userController.updateMe);

router.post('/change-password', authenticateToken, userController.changePassword);

module.exports = router;