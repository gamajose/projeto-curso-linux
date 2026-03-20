// src/controllers/userController.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Função para buscar os dados do usuário
exports.getMe = async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT id, name, email, username, avatar_url, xp, level, cpf, birth_date, gender, 
             phone_fixed, phone_mobile, address_street, address_number, address_district, 
             address_city, address_state, address_zipcode, linkedin_profile, organization, "position", observations, is_admin 
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const user = userResult.rows[0];

        if (user.cpf) {
            // Remove qualquer formatação existente para garantir
            const cleanedCpf = user.cpf.replace(/\D/g, ''); 
            if (cleanedCpf.length === 11) {
                user.cpf = cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.$3-$4');
            }
        }

        res.json(user);

    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }
};

// Função para atualizar o perfil do usuário (sem alterações)
exports.updateMe = async (req, res) => {
    const userId = req.user.id;
    let { name, username, cpf, birth_date, gender, phone_fixed, phone_mobile, address_street, address_number, address_district, address_city, address_state, address_zipcode, linkedin_profile, organization, position, observations } = req.body;

    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ message: 'Nome de usuário inválido. Use de 3 a 20 letras, números ou underscores.' });
    }

    try {
        const currentUserResult = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
        let avatar_url = currentUserResult.rows[0].avatar_url;

        if (req.file) {
            avatar_url = `/uploads/avatars/${req.file.filename}`;
        }

        const fieldsToUpdate = { name, username, cpf, birth_date, gender, phone_fixed, phone_mobile, address_street, address_number, address_district, address_city, address_state, address_zipcode, linkedin_profile, organization, "position": position, observations, avatar_url };
        
        const updates = [];
        const values = [];
        let queryIndex = 1;

        for (const [key, value] of Object.entries(fieldsToUpdate)) {
            if (value !== undefined && value !== null) {
                updates.push(`"${key}" = $${queryIndex++}`);
                values.push(value);
            }
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        values.push(userId);

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${queryIndex} RETURNING id, name, email, username, avatar_url`;

        const updatedUser = await pool.query(query, values);

        if (updatedUser.rows[0].cpf) {
             updatedUser.rows[0].cpf = decrypt(updatedUser.rows[0].cpf);
        }
        
        res.json(updatedUser.rows[0]);

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'O nome de usuário ou e-mail já está em uso.' });
        }
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// Função para alterar a senha (sem alterações)
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Senha atual e nova senha são obrigatórias." });
    }

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = userResult.rows[0];
        
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "A senha atual está incorreta." });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newPasswordHash, userId]);
        
        res.json({ message: "Senha alterada com sucesso." });

    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// Novas funções de gamificação
exports.getUserBadges = async (req, res) => {
    try {
        const badgesResult = await pool.query(
            `SELECT b.name, b.description, b.image_url 
             FROM user_badges ub 
             JOIN badges b ON ub.badge_id = b.id 
             WHERE ub.user_id = $1`,
            [req.user.id]
        );
        res.json(badgesResult.rows);
    } catch (error) {
        console.error("Erro ao buscar insígnias do usuário:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

exports.getUserCertificates = async (req, res) => {
    try {
        const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        const userName = userResult.rows[0].name;

        const certificatesResult = await pool.query(
            "SELECT * FROM certificates WHERE participant_name = $1 ORDER BY completion_date DESC",
            [userName]
        );
        res.json(certificatesResult.rows);
    } catch (error) {
        console.error("Erro ao buscar certificados do usuário:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};