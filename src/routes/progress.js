// src/routes/progress.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authenticateToken = require('../middleware/auth');

// Rota para buscar o progresso do usuário
router.get('/', authenticateToken, progressController.getProgress);

// Rota para marcar uma aula como concluída
router.post('/complete-lesson', authenticateToken, progressController.completeLesson);

module.exports = router;