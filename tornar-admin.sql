-- Script para tornar um usuário administrador
-- Execute este script no banco de dados para tornar você admin

-- Opção 1: Tornar admin pelo EMAIL
UPDATE users SET is_admin = true WHERE email = 'seu-email@example.com';

-- Opção 2: Tornar admin pelo USERNAME
UPDATE users SET is_admin = true WHERE username = 'seu-username';

-- Opção 3: Tornar admin pelo ID
UPDATE users SET is_admin = true WHERE id = 1;

-- Verificar quem é admin
SELECT id, name, email, username, is_admin FROM users WHERE is_admin = true;

-- Listar todos os usuários
SELECT id, name, email, username, is_admin, created_at FROM users ORDER BY id;
