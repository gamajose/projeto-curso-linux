const Certificate = require('../models/Certificate');
const ImageService = require('../services/imageService');
const crypto = require('crypto');

exports.getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findByCertificateId(req.params.certificateId);
        if (!certificate) {
            return res.status(404).json({ error: 'Certificado não encontrado' });
        }
        res.json(certificate);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.generateCertificateImage = async (req, res) => {
    try {
        const certificate = await Certificate.findByCertificateId(req.params.certificateId);
        if (!certificate || !certificate.valido) {
            return res.status(404).json({ error: 'Certificado inválido ou não encontrado' });
        }
        const imageBuffer = await ImageService.generateCertificateImageFromData(certificate);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="certificado-${certificate.certificate_id}.png"`);
        res.send(imageBuffer);
        await Certificate.incrementDownloadCount(certificate.id);
    } catch (error) {
        console.error('❌ Erro ao gerar ou enviar imagem:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro ao gerar imagem do certificado' });
        }
    }
};

exports.createCertificate = async (req, res) => {
    try {
        const newCertificate = await Certificate.create({
            ...req.body,
            hash_verificacao: crypto.randomBytes(6).toString('hex')
        });
        res.status(201).json(newCertificate);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar certificado' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await Certificate.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error.message, error.stack);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};