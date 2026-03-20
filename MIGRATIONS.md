# 🗄️ Sistema de Auto-Criação de Tabelas

## 📋 Visão Geral

O sistema Academy Z agora possui **auto-criação automática de tabelas**. Quando o servidor inicia ou quando você executa o script de migrations, todas as tabelas necessárias são criadas automaticamente se não existirem.

---

## ✨ Funcionalidades

### 1. **Auto-Criação na Inicialização do Servidor** ✅
- ✅ Quando você inicia o servidor com `npm start` ou `pm2 start`
- ✅ O sistema verifica e cria todas as tabelas automaticamente
- ✅ Não é necessário executar SQL manualmente
- ✅ Seguro: Usa `CREATE TABLE IF NOT EXISTS`

### 2. **Script Manual de Migrations** ✅
- ✅ Comando: `npm run migrate`
- ✅ Executa migrations sem iniciar o servidor
- ✅ Útil para setup inicial ou manutenção

### 3. **Comandos Auxiliares** ✅
- ✅ `npm run migrate:list` - Lista todas as tabelas existentes
- ✅ `npm run migrate:check users` - Verifica se uma tabela existe

---

## 🚀 Como Usar

### Iniciar Servidor (Auto-Migration)
```bash
# O servidor automaticamente cria as tabelas ao iniciar
npm start

# OU com PM2
pm2 start ecosystem.config.cjs

# Logs mostrarão:
# 🔧 Verificando estrutura do banco de dados...
# ✅ Tabela "users" verificada/criada
# ✅ Tabela "courses" verificada/criada
# ...
# ✅ Todas as migrations foram executadas com sucesso!
```

### Executar Migrations Manualmente
```bash
# Executar todas as migrations
npm run migrate

# Listar tabelas existentes
npm run migrate:list

# Verificar se uma tabela existe
npm run migrate:check users
npm run migrate:check certificates

# Ver ajuda
node migrate.js --help
```

---

## 📊 Tabelas Criadas Automaticamente

### 1. **users** - Usuários do sistema
```sql
- id (SERIAL PRIMARY KEY)
- name, email, password_hash
- username (único), is_admin
- avatar_url, cpf, birth_date, gender
- telefones, endereço completo
- linkedin_profile, organization, position
- xp, level (gamificação)
- reset_token (recuperação de senha)
- created_at
```

**Índices:**
- `idx_users_email` - Busca por email
- `idx_users_username` - Busca por username

---

### 2. **courses** - Cursos disponíveis
```sql
- id (SERIAL PRIMARY KEY)
- title (nome do curso)
- description (descrição)
- duration (duração, ex: "2 horas")
- created_at
```

**Dados iniciais:**
- Curso "Introdução ao Linux" já é criado automaticamente

---

### 3. **lessons** - Aulas dos cursos
```sql
- id (SERIAL PRIMARY KEY)
- course_id (FK para courses)
- title (título da aula)
- duration (duração, ex: "15 min")
- video_url (URL do YouTube)
- created_at
```

**Índices:**
- `idx_lessons_course_id` - Busca aulas por curso

**Dados iniciais:**
- 5 aulas do curso de Linux já são criadas automaticamente

---

### 4. **user_course_progress** - Progresso dos alunos
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK para users)
- course_id (ID do curso)
- lesson_id (ID da aula)
- completed_at (quando completou)
- UNIQUE(user_id, course_id, lesson_id)
```

**Índices:**
- `idx_progress_user_id` - Busca por usuário
- `idx_progress_course_id` - Busca por curso

---

### 5. **certificates** - Certificados emitidos
```sql
- id (SERIAL PRIMARY KEY)
- participant_name, course_name
- hours (carga horária)
- issue_date, completion_date
- certificate_id (único, ex: "LINUX2025-001")
- modalidade (Online/Presencial/Híbrido)
- instrutor, diretor, organizacao
- hash_verificacao (único, 16 caracteres)
- valido (boolean)
- download_count (contador)
- created_at, updated_at
```

**Índices:**
- `idx_certificates_participant_name` - Busca por nome
- `idx_certificates_course_name` - Busca por curso
- `idx_certificates_certificate_id` - Busca por ID
- `idx_certificates_hash_verificacao` - Busca por hash
- `idx_certificates_name_course` - Busca combinada

---

### 6. **badges** - Insígnias/Conquistas
```sql
- id (SERIAL PRIMARY KEY)
- name (nome da insígnia)
- description (descrição)
- image_url (URL da imagem)
- created_at
```

---

### 7. **user_badges** - Insígnias dos usuários
```sql
- user_id (FK para users)
- badge_id (FK para badges)
- earned_at (quando ganhou)
- PRIMARY KEY (user_id, badge_id)
```

**Índices:**
- `idx_user_badges_user_id` - Busca por usuário
- `idx_user_badges_badge_id` - Busca por insígnia

---

## 🔧 Arquitetura do Sistema

```
server.js
    └─> startServer()
         └─> pool.connect() - Conecta ao banco
         └─> DatabaseMigrations.runAll()
              ├─> createUsersTable()
              ├─> createCoursesTable()
              ├─> createLessonsTable()
              ├─> createUserCourseProgressTable()
              ├─> createCertificatesTable()
              ├─> createBadgesTable()
              └─> createUserBadgesTable()
```

---

## 🛡️ Segurança e Confiabilidade

### ✅ Características de Segurança

1. **Idempotência**
   - Todas as migrations usam `CREATE TABLE IF NOT EXISTS`
   - Pode executar múltiplas vezes sem problemas
   - Não sobrescreve dados existentes

2. **Transações**
   - Cada migration é independente
   - Se uma falhar, as outras continuam
   - Logs detalhados de cada operação

3. **Validação**
   - Verifica conexão antes de executar
   - Trata erros individualmente
   - Rollback automático em caso de erro SQL

4. **Índices**
   - Todos os índices usam `CREATE INDEX IF NOT EXISTS`
   - Não duplica índices existentes
   - Melhora performance de queries

---

## 📝 Exemplos de Uso

### Exemplo 1: Primeiro Deploy
```bash
# Na VM Linux
cd /home/seu-usuario/webapp

# O banco está vazio - sem tabelas
npm run migrate:list
# Output: ⚠️ Nenhuma tabela encontrada

# Executar migrations
npm run migrate
# Output:
# 🔄 Iniciando migrations...
# ✅ Tabela "users" verificada/criada
# ✅ Tabela "courses" verificada/criada
# ... (todas as tabelas)
# ✅ Todas as migrations foram executadas com sucesso!

# Verificar tabelas criadas
npm run migrate:list
# Output:
# 1. badges
# 2. certificates
# 3. courses
# 4. lessons
# 5. user_badges
# 6. user_course_progress
# 7. users
```

### Exemplo 2: Servidor já Configurado
```bash
# Iniciar servidor normalmente
pm2 start ecosystem.config.cjs

# Logs do PM2 mostram:
# ✅ Conectado ao PostgreSQL
# 🔧 Verificando estrutura do banco de dados...
# ✅ Tabela "users" verificada/criada (já existe)
# ... (verifica todas)
# ✅ Banco de dados pronto!
# ✅ Servidor rodando na porta 3001
```

### Exemplo 3: Verificar Tabela Específica
```bash
# Verificar se tabela de usuários existe
npm run migrate:check users
# Output: ✅ A tabela "users" existe

# Verificar tabela que não existe
npm run migrate:check produtos
# Output: ❌ A tabela "produtos" NÃO existe
```

---

## 🔄 Fluxo de Trabalho Recomendado

### 1. **Novo Deploy**
```bash
# 1. Clonar/copiar código
cd /home/seu-usuario/webapp

# 2. Instalar dependências
npm install

# 3. Configurar .env
cp .env.example .env
nano .env  # Configurar DB_HOST, DB_USER, DB_PASSWORD, etc.

# 4. Executar migrations (opcional, server.js faz isso)
npm run migrate

# 5. Iniciar servidor
pm2 start ecosystem.config.cjs
pm2 save

# Pronto! Todas as tabelas foram criadas
```

### 2. **Atualização de Código**
```bash
# 1. Parar servidor
pm2 stop academyz

# 2. Atualizar código
git pull origin main

# 3. Instalar novas dependências (se houver)
npm install

# 4. Reiniciar servidor (migrations executam automaticamente)
pm2 restart academyz

# Migrations verificam e criam novas tabelas se necessário
```

### 3. **Manutenção do Banco**
```bash
# Listar todas as tabelas
npm run migrate:list

# Ver estrutura de uma tabela
psql -h localhost -U jose -d curso -c "\d users"

# Resetar banco (CUIDADO: apaga tudo!)
psql -h localhost -U jose -d curso -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate  # Recria todas as tabelas
```

---

## ⚠️ Avisos Importantes

### 1. **Não Apaga Dados**
- ✅ Migrations **NUNCA** apagam tabelas existentes
- ✅ Migrations **NUNCA** apagam dados
- ✅ Apenas **CRIAM** o que não existe

### 2. **Dados Iniciais**
- ✅ Curso "Introdução ao Linux" é criado automaticamente
- ✅ 5 aulas do curso são criadas automaticamente
- ✅ Use `ON CONFLICT DO NOTHING` para evitar duplicação

### 3. **Performance**
- ✅ Migrations são rápidas (< 1 segundo)
- ✅ Não bloqueia o servidor
- ✅ Executadas apenas na inicialização

---

## 🐛 Troubleshooting

### Problema: "Erro ao conectar ao banco"
```bash
# Verificar conexão
psql -h 45.162.246.68 -U jose -d curso -c "SELECT 1"

# Verificar .env
cat .env | grep DB_
```

### Problema: "Tabela não foi criada"
```bash
# Ver logs detalhados
npm run migrate

# Verificar permissões do usuário
psql -h 45.162.246.68 -U jose -d curso -c "SELECT current_user, current_database()"
```

### Problema: "Migration travada"
```bash
# Verificar locks no banco
psql -h 45.162.246.68 -U jose -d curso -c "SELECT * FROM pg_locks WHERE NOT granted"

# Matar processos travados (cuidado!)
psql -h 45.162.246.68 -U jose -d curso -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction'"
```

---

## 📚 Documentação Adicional

### Arquivos Relacionados
- `src/config/migrations.js` - Código das migrations
- `migrate.js` - Script CLI para executar migrations
- `server.js` - Executa migrations na inicialização
- `package.json` - Scripts npm

### Logs
```bash
# Ver logs do servidor
pm2 logs academyz

# Ver logs de migrations manualmente
npm run migrate 2>&1 | tee migration.log
```

---

## ✅ Conclusão

**Agora você não precisa mais se preocupar com a estrutura do banco!**

- ✅ Tabelas são criadas automaticamente
- ✅ Dados iniciais são inseridos
- ✅ Índices são criados para performance
- ✅ Sistema totalmente automatizado
- ✅ Sem risco de perder dados

**Basta iniciar o servidor e tudo funciona!** 🚀
