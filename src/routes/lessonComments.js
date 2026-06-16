const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
let tableReady = false;

async function ensureCommentsTable() {
    if (tableReady) return;

    await pool.query(`
        CREATE TABLE IF NOT EXISTS lesson_comments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
            lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
            content TEXT NOT NULL,
            visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(course_id, lesson_id, visibility);
        CREATE INDEX IF NOT EXISTS idx_lesson_comments_user ON lesson_comments(user_id);
    `);

    tableReady = true;
}

async function userCanManageComment(userId, commentId) {
    const result = await pool.query(`
        SELECT lc.id, lc.user_id, COALESCE(u.is_admin, false) AS is_admin
        FROM lesson_comments lc
        CROSS JOIN users u
        WHERE lc.id = $1 AND u.id = $2
    `, [commentId, userId]);

    if (!result.rows.length) return false;
    const row = result.rows[0];
    return Number(row.user_id) === Number(userId) || row.is_admin;
}

router.use(authenticateToken);

router.get('/:courseId/:lessonId', async (req, res) => {
    const { courseId, lessonId } = req.params;

    try {
        await ensureCommentsTable();

        const result = await pool.query(`
            SELECT
                lc.id,
                lc.user_id,
                lc.course_id,
                lc.lesson_id,
                lc.content,
                lc.visibility,
                lc.created_at,
                lc.updated_at,
                u.name AS author_name,
                CASE WHEN lc.user_id = $1 THEN true ELSE false END AS is_owner
            FROM lesson_comments lc
            JOIN users u ON u.id = lc.user_id
            WHERE lc.course_id = $2
              AND lc.lesson_id = $3
              AND (lc.visibility = 'public' OR lc.user_id = $1)
            ORDER BY lc.created_at DESC, lc.id DESC
        `, [req.user.id, courseId, lessonId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar comentários da aula:', error);
        res.status(500).json({ message: 'Erro ao buscar comentários da aula.' });
    }
});

router.post('/', async (req, res) => {
    const { courseId, lessonId, content, visibility } = req.body;
    const cleanVisibility = visibility === 'public' ? 'public' : 'private';

    if (!courseId || !lessonId) {
        return res.status(400).json({ message: 'Curso e aula são obrigatórios.' });
    }

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Digite uma anotação ou comentário.' });
    }

    try {
        await ensureCommentsTable();

        const result = await pool.query(`
            INSERT INTO lesson_comments (user_id, course_id, lesson_id, content, visibility)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [req.user.id, courseId, lessonId, content.trim(), cleanVisibility]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar comentário da aula:', error);
        res.status(500).json({ message: 'Erro ao salvar anotação/comentário.' });
    }
});

router.put('/:id', async (req, res) => {
    const { content, visibility } = req.body;
    const cleanVisibility = visibility === 'public' ? 'public' : 'private';

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Digite uma anotação ou comentário.' });
    }

    try {
        await ensureCommentsTable();

        const canManage = await userCanManageComment(req.user.id, req.params.id);
        if (!canManage) {
            return res.status(403).json({ message: 'Você não tem permissão para editar este comentário.' });
        }

        const result = await pool.query(`
            UPDATE lesson_comments
            SET content = $1, visibility = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `, [content.trim(), cleanVisibility, req.params.id]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao editar comentário da aula:', error);
        res.status(500).json({ message: 'Erro ao editar anotação/comentário.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await ensureCommentsTable();

        const canManage = await userCanManageComment(req.user.id, req.params.id);
        if (!canManage) {
            return res.status(403).json({ message: 'Você não tem permissão para excluir este comentário.' });
        }

        await pool.query('DELETE FROM lesson_comments WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir comentário da aula:', error);
        res.status(500).json({ message: 'Erro ao excluir anotação/comentário.' });
    }
});

module.exports = router;
