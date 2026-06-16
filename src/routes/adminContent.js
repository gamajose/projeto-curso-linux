const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { checkIsAdmin } = require('../middleware/auth');

const router = express.Router();

const templatesDir = path.join(__dirname, '..', '..', 'certificates', 'templates');
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'lessons');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeBase = path.basename(file.originalname || 'video', ext).replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
        cb(null, `${Date.now()}-${safeBase}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Formato de vídeo não suportado. Use MP4, WebM, OGG ou MOV.'));
    }
});

function listCertificateTemplates() {
    try {
        if (!fs.existsSync(templatesDir)) return [];
        return fs.readdirSync(templatesDir)
            .filter(file => file.endsWith('.svg'))
            .map(file => {
                const value = path.basename(file, '.svg');
                return {
                    value,
                    label: value
                        .replace(/^cert-mod-/, '')
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, char => char.toUpperCase())
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
        console.error('Erro ao listar templates de certificado:', error);
        return [];
    }
}

async function ensureContentSchema() {
    await pool.query(`
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_template VARCHAR(100) DEFAULT 'certificado-template';
        UPDATE courses SET certificate_template = 'certificado-template' WHERE certificate_template IS NULL OR certificate_template = '';
    `);
}

router.use(authenticateToken, checkIsAdmin);
router.use(async (_req, res, next) => {
    try {
        await ensureContentSchema();
        next();
    } catch (error) {
        console.error('Erro ao preparar estrutura de conteúdo:', error);
        res.status(500).json({ message: 'Erro ao preparar estrutura de conteúdo.' });
    }
});

router.get('/catalog', async (_req, res) => {
    try {
        const sections = await pool.query(`
            SELECT id, name, description, icon, display_order, created_at
            FROM course_sections
            ORDER BY display_order, name
        `);

        const courses = await pool.query(`
            SELECT c.*, s.name AS section_name
            FROM courses c
            LEFT JOIN course_sections s ON s.id = c.section_id
            ORDER BY COALESCE(s.display_order, 999), c.display_order, c.id
        `);

        const lessons = await pool.query(`
            SELECT *
            FROM lessons
            ORDER BY course_id, display_order, id
        `);

        res.json({
            sections: sections.rows,
            courses: courses.rows,
            lessons: lessons.rows,
            templates: listCertificateTemplates()
        });
    } catch (error) {
        console.error('Erro ao carregar catálogo admin:', error);
        res.status(500).json({ message: 'Erro ao carregar catálogo.' });
    }
});

router.post('/sections', async (req, res) => {
    const { name, description, icon, display_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Nome da seção é obrigatório.' });

    try {
        const result = await pool.query(`
            INSERT INTO course_sections (name, description, icon, display_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [name.trim(), description || null, icon || '📚', Number(display_order) || 0]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar seção:', error);
        res.status(500).json({ message: 'Erro ao criar seção.' });
    }
});

router.put('/sections/:id', async (req, res) => {
    const { name, description, icon, display_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Nome da seção é obrigatório.' });

    try {
        const result = await pool.query(`
            UPDATE course_sections
            SET name = $1, description = $2, icon = $3, display_order = $4
            WHERE id = $5
            RETURNING *
        `, [name.trim(), description || null, icon || '📚', Number(display_order) || 0, req.params.id]);

        if (!result.rows.length) return res.status(404).json({ message: 'Seção não encontrada.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar seção:', error);
        res.status(500).json({ message: 'Erro ao atualizar seção.' });
    }
});

router.delete('/sections/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM course_sections WHERE id = $1 RETURNING id', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ message: 'Seção não encontrada.' });
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir seção:', error);
        res.status(500).json({ message: 'Não foi possível excluir a seção. Verifique se existem cursos vinculados.' });
    }
});

router.post('/courses', async (req, res) => {
    const { section_id, title, description, duration, display_order, certificate_template } = req.body;
    if (!section_id) return res.status(400).json({ message: 'Seção do curso é obrigatória.' });
    if (!title || !title.trim()) return res.status(400).json({ message: 'Título do curso é obrigatório.' });

    try {
        const result = await pool.query(`
            INSERT INTO courses (section_id, title, description, duration, display_order, certificate_template)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [section_id, title.trim(), description || null, duration || null, Number(display_order) || 0, certificate_template || 'certificado-template']);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        res.status(500).json({ message: 'Erro ao criar curso.' });
    }
});

router.put('/courses/:id', async (req, res) => {
    const { section_id, title, description, duration, display_order, certificate_template } = req.body;
    if (!section_id) return res.status(400).json({ message: 'Seção do curso é obrigatória.' });
    if (!title || !title.trim()) return res.status(400).json({ message: 'Título do curso é obrigatório.' });

    try {
        const result = await pool.query(`
            UPDATE courses
            SET section_id = $1, title = $2, description = $3, duration = $4, display_order = $5, certificate_template = $6
            WHERE id = $7
            RETURNING *
        `, [section_id, title.trim(), description || null, duration || null, Number(display_order) || 0, certificate_template || 'certificado-template', req.params.id]);

        if (!result.rows.length) return res.status(404).json({ message: 'Curso não encontrado.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar curso:', error);
        res.status(500).json({ message: 'Erro ao atualizar curso.' });
    }
});

router.delete('/courses/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ message: 'Curso não encontrado.' });
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir curso:', error);
        res.status(500).json({ message: 'Erro ao excluir curso.' });
    }
});

router.post('/lessons', async (req, res) => {
    const { course_id, title, duration, video_url, video_source, description, display_order } = req.body;
    if (!course_id) return res.status(400).json({ message: 'Curso da aula é obrigatório.' });
    if (!title || !title.trim()) return res.status(400).json({ message: 'Título da aula é obrigatório.' });

    try {
        const result = await pool.query(`
            INSERT INTO lessons (course_id, title, duration, video_url, video_source, description, display_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [course_id, title.trim(), duration || null, video_url || null, video_source || 'external', description || null, Number(display_order) || 0]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar aula:', error);
        res.status(500).json({ message: 'Erro ao criar aula.' });
    }
});

router.put('/lessons/:id', async (req, res) => {
    const { course_id, title, duration, video_url, video_source, description, display_order } = req.body;
    if (!course_id) return res.status(400).json({ message: 'Curso da aula é obrigatório.' });
    if (!title || !title.trim()) return res.status(400).json({ message: 'Título da aula é obrigatório.' });

    try {
        const result = await pool.query(`
            UPDATE lessons
            SET course_id = $1, title = $2, duration = $3, video_url = $4, video_source = $5, description = $6, display_order = $7
            WHERE id = $8
            RETURNING *
        `, [course_id, title.trim(), duration || null, video_url || null, video_source || 'external', description || null, Number(display_order) || 0, req.params.id]);

        if (!result.rows.length) return res.status(404).json({ message: 'Aula não encontrada.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar aula:', error);
        res.status(500).json({ message: 'Erro ao atualizar aula.' });
    }
});

router.delete('/lessons/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING id', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ message: 'Aula não encontrada.' });
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir aula:', error);
        res.status(500).json({ message: 'Erro ao excluir aula.' });
    }
});

router.post('/lessons/:id/upload', upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Arquivo de vídeo é obrigatório.' });

    try {
        const publicUrl = `/uploads/lessons/${req.file.filename}`;
        const result = await pool.query(`
            UPDATE lessons
            SET video_url = $1, video_source = 'local'
            WHERE id = $2
            RETURNING *
        `, [publicUrl, req.params.id]);

        if (!result.rows.length) return res.status(404).json({ message: 'Aula não encontrada.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao salvar upload da aula:', error);
        res.status(500).json({ message: 'Erro ao salvar vídeo da aula.' });
    }
});

module.exports = router;
