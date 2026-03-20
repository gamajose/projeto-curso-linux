const jwt = require('jsonwebtoken');

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
 */
function checkIsAdmin(req, res, next) {
    // Verificar se o usuário está autenticado
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Não autenticado',
            message: 'Você precisa estar logado para acessar esta área.' 
        });
    }

    // Verificar se o usuário é admin
    if (!req.user.is_admin) {
        return res.status(403).json({ 
            error: 'Acesso negado',
            message: 'Apenas administradores podem acessar esta área.' 
        });
    }

    next();
}

module.exports = authenticateToken;
module.exports.checkIsAdmin = checkIsAdmin;
