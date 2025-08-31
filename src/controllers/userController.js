// src/controllers/userController.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Função para buscar os dados do usuário logado (CORRIGIDA)
exports.getMe = async (req, res) => {
    try {
        const userResult = await pool.query(
            // Seleciona todas as colunas, incluindo as novas de gamificação
            `SELECT id, name, email, avatar_url, xp, level, cpf, birth_date, gender, 
             phone_fixed, phone_mobile, address_street, address_number, address_district, 
             address_city, address_state, address_zipcode, linkedin_profile, organization, "position", observations 
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            // Envia a resposta de erro e PARA a execução com 'return'
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Envia a resposta de sucesso e PARA a execução
        res.json(userResult.rows[0]);

    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        // Só envia uma resposta de erro se a de sucesso ainda não foi enviada
        if (!res.headersSent) {
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }
};

// Função para atualizar o perfil do usuário (sem alterações)
exports.updateMe = async (req, res) => {
    const userId = req.user.id;
    const { name, cpf, birth_date, gender, phone_fixed, phone_mobile, address_street, address_number, address_district, address_city, address_state, address_zipcode, linkedin_profile, organization, position, observations } = req.body;

    let avatar_url = req.body.avatar_url; // Mantém a URL existente se não houver novo upload
    if (req.file) {
        // O caminho deve ser relativo à pasta 'public'
        avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    try {
        const updatedUser = await pool.query(
            `UPDATE users SET 
                name = $1, cpf = $2, birth_date = $3, gender = $4, phone_fixed = $5, phone_mobile = $6, 
                address_street = $7, address_number = $8, address_district = $9, address_city = $10, 
                address_state = $11, address_zipcode = $12, linkedin_profile = $13, organization = $14, 
                "position" = $15, observations = $16, avatar_url = $17 
            WHERE id = $18 RETURNING id, name, email, avatar_url`,
            [name, cpf, birth_date, gender, phone_fixed, phone_mobile, address_street, address_number, address_district, address_city, address_state, address_zipcode, linkedin_profile, organization, position, observations, avatar_url, userId]
        );
        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
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