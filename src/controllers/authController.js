const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, password_hash]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário. O e-mail já pode estar em uso.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }
    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.recoverPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 3600000); // Expira em 1 hora

            await pool.query(
                "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
                [resetToken, resetTokenExpires, user.id]
            );

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, secure: false,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });

            const resetUrl = `${process.env.APP_BASE_URL}/reset?token=${resetToken}`;
            await transporter.sendMail({
                to: user.email,
                from: `"Academy Z" <${process.env.EMAIL_USER}>`,
                subject: 'Recuperação de Senha',
                html: `<p>Você solicitou uma recuperação de senha. Clique neste <a href="${resetUrl}">link</a> para redefinir sua senha.</p><p>Este link expira em 1 hora.</p>`,
            });
        }
        res.json({ message: 'Se um usuário com este e-mail existir, um link de recuperação será enviado.' });
    } catch (error) {
        console.error('Erro na recuperação de senha:', error);
        res.status(500).json({ message: 'Erro ao processar a solicitação.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }
    try {
        const userResult = await pool.query(
            "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
            [token]
        );
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }
        const user = userResult.rows[0];
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        await pool.query(
            "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
            [password_hash, user.id]
        );
        res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};