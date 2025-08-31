const pool = require('../config/database');

exports.getAllCourses = async (req, res) => {
    try {
        const coursesResult = await pool.query('SELECT * FROM courses ORDER BY id');
        const lessonsResult = await pool.query('SELECT * FROM lessons ORDER BY id');

        const courses = coursesResult.rows.map(course => ({
            ...course,
            lessons: lessonsResult.rows.filter(lesson => lesson.course_id === course.id)
        }));

        res.json(courses);
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};