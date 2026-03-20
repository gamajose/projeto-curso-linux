// src/routes/certificates.js
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authenticateToken = require('../middleware/auth');
const { checkIsAdmin } = require('../middleware/auth');


// Rota de estatísticas (para a home page)
router.get('/stats', certificateController.getStats);

// Rota para buscar detalhes de um certificado por hash
router.get('/verify-hash/:hash', certificateController.getCertificateByHash);

// Rota para buscar detalhes de um certificado
router.get('/certificate/:certificateId', certificateController.getCertificateById);

// Rota para gerar e baixar a imagem do certificado
router.get('/generate/:certificateId', certificateController.generateCertificateImage);

// Rota para criar um novo certificado
router.post('/', authenticateToken, certificateController.createCertificate);

// Rota admin para criar certificado manualmente (PROTEGIDA - Apenas admins)
router.post('/admin/create', authenticateToken, checkIsAdmin, certificateController.createCertificateAdmin);

module.exports = router;