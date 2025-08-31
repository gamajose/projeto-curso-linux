// src/routes/ranking.js
const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authenticateToken = require('../middleware/auth');

// Rotas públicas, mas exigem token para garantir que só usuários logados vejam
router.get('/weekly', authenticateToken, rankingController.getWeeklyRanking);
router.get('/monthly', authenticateToken, rankingController.getMonthlyRanking);

module.exports = router;