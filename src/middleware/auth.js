const jwt = require('jsonwebtoken');
const pool = require('../config/database');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // Não autorizado
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Token inválido ou expirado
        }
        req.user = user;
        next();
    });
}

/**
 * Middleware para verificar se o usuário é administrador
 * Busca diretamente no banco para garantir que está atualizado
 */
async function checkIsAdmin(req, res, next) {
    // Verificar se o usuário está autenticado
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Não autenticado',
            message: 'Você precisa estar logado para acessar esta área.' 
        });
    }

    try {
        // Buscar is_admin diretamente do banco
        const result = await pool.query(
            'SELECT is_admin FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Usuário não encontrado',
                message: 'Usuário não existe no sistema.' 
            });
        }

        const user = result.rows[0];

        // Verificar se o usuário é admin
        if (!user.is_admin) {
            return res.status(403).json({ 
                error: 'Acesso negado',
                message: 'Apenas administradores podem acessar esta área.' 
            });
        }

        // Atualizar req.user com is_admin do banco
        req.user.is_admin = true;
        next();

    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        return res.status(500).json({ 
            error: 'Erro interno',
            message: 'Erro ao verificar permissões de administrador.' 
        });
    }
}

module.exports = authenticateToken;
module.exports.checkIsAdmin = checkIsAdmin;
