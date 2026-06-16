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
        const { participant_name, course_name } = req.body;

        const existingCert = await Certificate.findByParticipantAndCourse(participant_name, course_name);
        if (existingCert) {
            console.log('Certificado já existe, retornando o existente:', existingCert.certificate_id);
            return res.status(200).json(existingCert);
        }
        
        const newCertificate = await Certificate.create({
            ...req.body,
            template_type: req.body.template_type || 'certificado-template',
            hash_verificacao: crypto.randomBytes(6).toString('hex')
        });
        res.status(201).json(newCertificate);

    } catch (error) {
        if (error.code === '23505') {
            const existingCert = await Certificate.findByParticipantAndCourse(req.body.participant_name, req.body.course_name);
            return res.status(200).json(existingCert);
        }
        console.error('Erro ao criar certificado:', error);
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

exports.createCertificateAdmin = async (req, res) => {
    try {
        const { participant_name, course_name, hours, modalidade, issue_date, completion_date, template_type } = req.body;

        if (!participant_name || !course_name || !hours || !issue_date || !completion_date) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        const year = new Date().getFullYear();
        const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const certificate_id = `${course_name.substring(0, 3).toUpperCase()}${year}-${randomCode}`;
        const hash_verificacao = crypto.randomBytes(8).toString('hex');

        const newCertificate = await Certificate.create({
            participant_name,
            course_name,
            hours,
            issue_date,
            completion_date,
            certificate_id,
            modalidade: modalidade || 'Online',
            template_type: template_type || 'certificado-template',
            hash_verificacao
        });

        res.status(201).json(newCertificate);

    } catch (error) {
        console.error('Erro ao criar certificado (admin):', error);
        res.status(500).json({ message: 'Erro ao criar certificado', error: error.message });
    }
};

exports.getCertificateByHash = async (req, res) => {
    try {
        const hash = req.params.hash;
        const certificate = await Certificate.findByHash(hash);
        
        if (!certificate) {
            return res.status(404).json({ error: 'Certificado não encontrado' });
        }
        
        res.json(certificate);
    } catch (error) {
        console.error('Erro ao buscar certificado por hash:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
