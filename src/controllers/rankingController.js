// src/controllers/rankingController.js
const pool = require('../config/database');

const XP_PER_LESSON = 15; // Garanta que este valor é o mesmo do progressController

const getRankingByPeriod = async (periodInDays) => {
    const query = `
        SELECT
            u.id,
            u.name,
            u.avatar_url,
            u.level,
            COUNT(ucp.id) * $1 AS xp_earned
        FROM
            users u
        JOIN
            user_course_progress ucp ON u.id = ucp.user_id
        WHERE
            ucp.completed_at >= NOW() - INTERVAL '${periodInDays} days'
        GROUP BY
            u.id, u.name, u.avatar_url, u.level
        ORDER BY
            xp_earned DESC
        LIMIT 10;
    `;
    const result = await pool.query(query, [XP_PER_LESSON]);
    return result.rows;
};

exports.getWeeklyRanking = async (req, res) => {
    try {
        const ranking = await getRankingByPeriod(7);
        res.json(ranking);
    } catch (error) {
        console.error('Erro ao buscar ranking semanal:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getMonthlyRanking = async (req, res) => {
    try {
        const ranking = await getRankingByPeriod(30);
        res.json(ranking);
    } catch (error) {
        console.error('Erro ao buscar ranking mensal:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};