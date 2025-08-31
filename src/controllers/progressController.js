// src/controllers/progressController.js
const pool = require('../config/database');

// Define a quantidade de XP por aula e a curva de nível
const XP_PER_LESSON = 15;
const LEVEL_THRESHOLDS = {
    2: 100, 3: 250, 4: 500, 5: 800, 6: 1200, 7: 1700, 8: 2300, 9: 3000, 10: 4000
};

// Função para verificar e conceder insígnias
async function checkAndAwardBadges(userId, newLevel, completedCourseId) {
    // 1. Verificar por nível
    const levelBadgeQuery = 'SELECT * FROM badges WHERE criteria_type = $1 AND criteria_value = $2';
    const levelBadgeResult = await pool.query(levelBadgeQuery, ['level', newLevel.toString()]);
    if (levelBadgeResult.rows.length > 0) {
        await pool.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, levelBadgeResult.rows[0].id]);
    }

    // 2. Verificar por curso concluído
    if (completedCourseId) {
        const courseBadgeQuery = 'SELECT * FROM badges WHERE criteria_type = $1 AND criteria_value = $2';
        const courseBadgeResult = await pool.query(courseBadgeQuery, ['course', completedCourseId.toString()]);
        if (courseBadgeResult.rows.length > 0) {
            await pool.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, courseBadgeResult.rows[0].id]);
        }
    }
}

exports.completeLesson = async (req, res) => {
    const { courseId, lessonId, totalLessonsInCourse } = req.body;
    const userId = req.user.id;

    if (!courseId || !lessonId || !totalLessonsInCourse) {
        return res.status(400).json({ message: 'Dados da aula incompletos.' });
    }

    try {
        // Passo 1: Insere o progresso da aula. ON CONFLICT evita erros se a aula já foi marcada.
        await pool.query(
            'INSERT INTO user_course_progress (user_id, course_id, lesson_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, course_id, lesson_id) DO NOTHING',
            [userId, courseId, lessonId]
        );

        // Passo 2: Busca o usuário para pegar XP e nível atuais.
        const userResult = await pool.query('SELECT xp, level FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        let { xp, level } = userResult.rows[0];

        // Passo 3: Adiciona o XP, verifica se subiu de nível e atualiza o usuário.
        xp += XP_PER_LESSON;
        const nextLevel = level + 1;
        if (LEVEL_THRESHOLDS[nextLevel] && xp >= LEVEL_THRESHOLDS[nextLevel]) {
            level = nextLevel;
        }
        await pool.query('UPDATE users SET xp = $1, level = $2 WHERE id = $3', [xp, level, userId]);

        // Passo 4: Verifica se o curso foi totalmente concluído.
        const progressResult = await pool.query(
            'SELECT COUNT(*) FROM user_course_progress WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );
        const lessonsCompletedCount = parseInt(progressResult.rows[0].count, 10);
        
        let completedCourseId = null;
        if (lessonsCompletedCount >= totalLessonsInCourse) {
            completedCourseId = courseId;
        }
        
        // Passo 5: Verifica se o usuário ganhou alguma insígnia.
        await checkAndAwardBadges(userId, level, completedCourseId);

        res.status(200).json({ message: 'Progresso salvo com sucesso!', newXp: xp, newLevel: level });

    } catch (error) {
        console.error('Erro ao salvar progresso:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getProgress = async (req, res) => {
    try {
        const result = await pool.query('SELECT course_id, lesson_id FROM user_course_progress WHERE user_id = $1', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar progresso:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};