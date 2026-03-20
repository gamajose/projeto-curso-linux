# 🔐 Sistema de Autenticação Admin - Configuração

## ✅ O Que Foi Implementado

### **Segurança Completa:**
1. ✅ Página de login exclusiva para admins: `/admin-login`
2. ✅ Verificação de token JWT
3. ✅ Verificação de permissão `is_admin` no banco
4. ✅ Proteção da página `/admin`
5. ✅ Proteção da API `/api/certificates/admin/create`
6. ✅ Redirecionamento automático se não for admin

---

## 🚀 CONFIGURAÇÃO INICIAL (Execute na VM)

### **Passo 1: Atualizar o Código**
```bash
cd /mnt/Projetos/projeto-curso-linux
git pull origin main
pm2 restart academyz
```

### **Passo 2: Tornar Você Admin no Banco**

#### **Opção A: Via psql (Recomendado)**
```bash
# Conectar ao banco
psql -h 192.168.3.31 -U jose -d curso

# Tornar seu usuário admin (substitua pelo seu email)
UPDATE users SET is_admin = true WHERE email = 'seu-email@example.com';

# Verificar
SELECT id, name, email, is_admin FROM users WHERE is_admin = true;

# Sair
\q
```

#### **Opção B: Via Script SQL**
```bash
# Editar o script com seu email
nano tornar-admin.sql

# Executar script
psql -h 192.168.3.31 -U jose -d curso -f tornar-admin.sql
```

#### **Opção C: Tornar o Primeiro Usuário Admin**
```bash
psql -h 192.168.3.31 -U jose -d curso -c "UPDATE users SET is_admin = true WHERE id = 1;"
```

---

## 🔓 Como Acessar o Painel Admin

### **1. Acesse a Página de Login Admin:**
```
http://academyz.com.br/admin-login
```

### **2. Faça Login:**
- **Email:** seu-email@example.com
- **Senha:** sua-senha

### **3. Sistema Verifica:**
- ✅ Credenciais corretas?
- ✅ Usuário é admin (`is_admin = true`)?
- ❌ Se não for admin: **"Acesso negado!"**

### **4. Redirecionamento Automático:**
- ✅ Se for admin → Redireciona para `/admin`
- ❌ Se não for admin → Mostra erro e volta para `/home`

---

## 🎯 Fluxo de Segurança

```
┌─────────────────────────────────────────┐
│  Usuário acessa /admin                  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Tem token JWT válido?                  │
└─────────────┬───────────────────────────┘
              │
        Não   │   Sim
    ┌─────────┴─────────┐
    ▼                   ▼
┌────────┐    ┌─────────────────────────┐
│Redireciona│  │  Busca dados do usuário │
│  para     │  │  (GET /api/users/me)    │
│/admin-login│  └─────────┬───────────────┘
└────────┘              │
                        ▼
              ┌──────────────────────┐
              │  is_admin = true?    │
              └─────────┬────────────┘
                        │
                  Não   │   Sim
              ┌─────────┴─────────┐
              ▼                   ▼
    ┌──────────────┐    ┌─────────────┐
    │Acesso Negado!│    │✅ Liberado! │
    │Redireciona   │    │Mostra Painel│
    │para /home    │    │    Admin    │
    └──────────────┘    └─────────────┘
```

---

## 🛡️ Proteções Implementadas

### **1. Proteção da Página /admin**
**Arquivo:** `public/admin.html`

```javascript
// Verifica se está logado
const token = localStorage.getItem('authToken');
if (!token) {
    window.location.href = '/admin-login';
    return;
}

// Verifica se é admin
const user = await fetch('/api/users/me', {
    headers: { 'Authorization': `Bearer ${token}` }
});

if (!user.is_admin) {
    alert('Acesso negado! Apenas administradores.');
    window.location.href = '/home';
    return;
}
```

### **2. Proteção da API de Emissão**
**Arquivo:** `src/routes/certificates.js`

```javascript
router.post('/admin/create', 
    authenticateToken,      // Verifica token JWT
    checkIsAdmin,           // Verifica se é admin
    certificateController.createCertificateAdmin
);
```

### **3. Middleware de Verificação**
**Arquivo:** `src/middleware/auth.js`

```javascript
function checkIsAdmin(req, res, next) {
    if (!req.user.is_admin) {
        return res.status(403).json({ 
            error: 'Acesso negado',
            message: 'Apenas administradores podem acessar esta área.' 
        });
    }
    next();
}
```

---

## 🔑 Gerenciamento de Admins

### **Listar Todos os Admins:**
```sql
SELECT id, name, email, username, is_admin, created_at 
FROM users 
WHERE is_admin = true;
```

### **Tornar Usuário Admin:**
```sql
-- Por email
UPDATE users SET is_admin = true WHERE email = 'usuario@example.com';

-- Por username
UPDATE users SET is_admin = true WHERE username = 'usuario123';

-- Por ID
UPDATE users SET is_admin = true WHERE id = 5;
```

### **Remover Admin:**
```sql
UPDATE users SET is_admin = false WHERE email = 'usuario@example.com';
```

### **Ver Quem Acessou o Admin (Adicionar Log - Futuro):**
```sql
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testes de Segurança

### **Teste 1: Acesso sem Login**
```bash
# Tentar acessar /admin sem token
curl -I http://localhost:3001/admin
# Deve redirecionar para /admin-login
```

### **Teste 2: Acesso com Usuário Normal (Não Admin)**
```bash
# Login com usuário normal
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"usuario@example.com","password":"senha123"}'

# Pegar o token da resposta
TOKEN="eyJhbGciOi..."

# Tentar emitir certificado
curl -X POST http://localhost:3001/api/certificates/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"participant_name":"Teste",...}'

# Deve retornar: 403 Forbidden
# {"error":"Acesso negado","message":"Apenas administradores..."}
```

### **Teste 3: Acesso com Admin**
```bash
# Login com admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin@example.com","password":"senha123"}'

# Pegar o token
ADMIN_TOKEN="eyJhbGciOi..."

# Emitir certificado
curl -X POST http://localhost:3001/api/certificates/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "participant_name":"João Silva",
    "course_name":"Curso de GCP",
    "hours":40,
    "modalidade":"Online",
    "issue_date":"2025-03-20",
    "completion_date":"2025-03-20"
  }'

# Deve retornar: 201 Created
# {"id":123,"certificate_id":"CUR2025-...","hash_verificacao":"..."}
```

---

## 🚨 Problemas Comuns

### **1. "Acesso negado! Apenas administradores..."**

**Causa:** Seu usuário não está marcado como admin no banco.

**Solução:**
```sql
psql -h 192.168.3.31 -U jose -d curso -c "UPDATE users SET is_admin = true WHERE email = 'seu-email@example.com';"
```

### **2. "Sessão expirada"**

**Causa:** Token JWT expirou (8 horas).

**Solução:**
```
1. Faça logout
2. Faça login novamente em /admin-login
```

### **3. Redirecionamento infinito**

**Causa:** Cache do navegador ou problema com token.

**Solução:**
```
1. Limpar localStorage: localStorage.clear()
2. Fechar e reabrir o navegador
3. Tentar em aba anônima
```

### **4. Erro 403 na API**

**Causa:** Middleware não está reconhecendo admin.

**Verificar:**
```javascript
// Abrir Console do navegador
console.log(localStorage.getItem('authToken'));

// Decodificar token JWT em jwt.io
// Verificar se tem "is_admin": true
```

---

## 📊 Estrutura do Token JWT

### **Antes (sem is_admin):**
```json
{
  "id": 1,
  "name": "José Moraes",
  "iat": 1234567890,
  "exp": 1234596690
}
```

### **Depois (com is_admin):**
```json
{
  "id": 1,
  "name": "José Moraes",
  "is_admin": true,
  "iat": 1234567890,
  "exp": 1234596690
}
```

---

## 🎯 Melhorias Futuras Sugeridas

### **1. Log de Ações Admin**
```sql
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255),
    certificate_id VARCHAR(50),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **2. 2FA (Autenticação de Dois Fatores)**
```javascript
// Enviar código por email ao fazer login
// Validar código antes de permitir acesso
```

### **3. Lista de IPs Permitidos**
```javascript
const ALLOWED_IPS = ['192.168.3.31', '10.0.0.1'];

if (!ALLOWED_IPS.includes(req.ip)) {
    return res.status(403).json({ error: 'IP não autorizado' });
}
```

### **4. Tempo de Sessão Reduzido**
```javascript
// Token expira em 2 horas para admin
const token = jwt.sign(
    { id: user.id, is_admin: true }, 
    JWT_SECRET, 
    { expiresIn: '2h' }  // Antes: 8h
);
```

---

## ✅ Checklist de Segurança

- [x] Login separado para admin (`/admin-login`)
- [x] Verificação de token JWT
- [x] Verificação de `is_admin` no banco
- [x] Proteção da página `/admin`
- [x] Proteção da API `/api/certificates/admin/create`
- [x] Redirecionamento se não for admin
- [x] Mensagens de erro claras
- [ ] Log de ações admin (futuro)
- [ ] 2FA (futuro)
- [ ] Lista de IPs permitidos (futuro)

---

## 📝 Resumo dos Comandos

### **Tornar Admin:**
```bash
psql -h 192.168.3.31 -U jose -d curso -c "UPDATE users SET is_admin = true WHERE email = 'seu-email@example.com';"
```

### **Verificar Admins:**
```bash
psql -h 192.168.3.31 -U jose -d curso -c "SELECT id, name, email, is_admin FROM users WHERE is_admin = true;"
```

### **Acessar:**
```
http://academyz.com.br/admin-login
```

---

**✅ Sistema de segurança completo implementado!**

**Agora apenas você (e outros usuários marcados como admin) podem acessar o painel de administração! 🔐**
