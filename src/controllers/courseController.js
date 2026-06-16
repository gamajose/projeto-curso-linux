const pool = require('../config/database');

exports.getAllCourses = async (req, res) => {
    try {
        const coursesResult = await pool.query(`
            SELECT
                c.*,
                COALESCE(s.name, 'T.I.') AS category,
                s.id AS section_id,
                s.name AS section_name,
                s.description AS section_description,
                s.icon AS section_icon
            FROM courses c
            LEFT JOIN course_sections s ON s.id = c.section_id
            ORDER BY COALESCE(s.display_order, 999), COALESCE(c.display_order, c.id), c.id
        `);

        const lessonsResult = await pool.query(`
            SELECT *
            FROM lessons
            ORDER BY course_id, COALESCE(display_order, id), id
        `);

        const courses = coursesResult.rows.map(course => ({
            ...course,
            lessons: lessonsResult.rows.filter(lesson => Number(lesson.course_id) === Number(course.id))
        }));

        res.json(courses);
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
