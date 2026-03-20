# 🚀 CORREÇÃO URGENTE - Atualizar Agora!

## 🐛 Problema Corrigido
**Erro:** `column "duration" of relation "lessons" does not exist`

**Causa:** As tabelas `courses` e `lessons` já existiam no banco mas não tinham a coluna `duration`.

**Solução:** Migration atualizada para adicionar a coluna automaticamente se não existir.

---

## ⚡ COMANDOS PARA EXECUTAR NA VM (URGENTE)

### 1. Parar o Servidor
```bash
pm2 stop academyz
```

### 2. Atualizar o Código
```bash
cd /mnt/Projetos/projeto-curso-linux
git pull origin main
```

### 3. Reiniciar o Servidor
```bash
pm2 restart academyz
```

### 4. Verificar os Logs
```bash
pm2 logs academyz --lines 30
```

**Você deve ver:**
```
✅ Conectado ao PostgreSQL com sucesso!
🔧 Verificando estrutura do banco de dados...
🔄 Iniciando migrations do banco de dados...
✅ Tabela "users" verificada/criada
✅ Tabela "courses" verificada/criada
✅ Tabela "lessons" verificada/criada
✅ Tabela "user_course_progress" verificada/criada
✅ Tabela "certificates" verificada/criada
✅ Tabela "badges" verificada/criada
✅ Tabela "user_badges" verificada/criada
✅ Todas as migrations foram executadas com sucesso!
✅ Banco de dados pronto!
✅ Servidor rodando na porta 3001
```

---

## 🔍 Se Ainda Houver Erro

### Opção 1: Adicionar Coluna Manualmente (Mais Rápido)
```bash
# Conectar ao banco
psql -h 192.168.3.31 -U jose -d curso

# Adicionar coluna duration
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration VARCHAR(50);

# Sair
\q

# Reiniciar servidor
pm2 restart academyz
```

### Opção 2: Executar Migration Manual
```bash
cd /mnt/Projetos/projeto-curso-linux
npm run migrate
```

---

## ✅ Teste Final

```bash
# Verificar se o servidor está rodando
curl http://localhost:3001/health

# Deve retornar:
# {"status":"OK","message":"Servidor está funcionando",...}

# Verificar tabelas
npm run migrate:list

# Deve mostrar:
# 1. badges
# 2. certificates
# 3. courses
# 4. lessons
# 5. user_badges
# 6. user_course_progress
# 7. users
```

---

## 📊 O Que Foi Corrigido

### Antes (com erro):
```sql
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    duration VARCHAR(50),  -- Tentava criar com duration
    ...
);

INSERT INTO lessons (duration, ...) VALUES (...);  -- ERRO!
```

### Depois (corrigido):
```sql
-- Primeiro cria a tabela sem duration
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    ...
);

-- Depois adiciona duration se não existir
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration VARCHAR(50);

-- Agora pode inserir com duration
INSERT INTO lessons (duration, ...) VALUES (...);  -- ✅ OK!
```

---

## 🎯 Resumo dos Comandos

```bash
# 1. Parar
pm2 stop academyz

# 2. Atualizar
cd /mnt/Projetos/projeto-curso-linux
git pull origin main

# 3. Reiniciar
pm2 restart academyz

# 4. Verificar
pm2 logs academyz --lines 30
curl http://localhost:3001/health
```

---

## 🆘 Se Precisar de Ajuda

1. **Ver logs completos:**
   ```bash
   pm2 logs academyz --lines 100
   ```

2. **Ver estrutura da tabela:**
   ```bash
   psql -h 192.168.3.31 -U jose -d curso -c "\d lessons"
   ```

3. **Limpar logs e reiniciar:**
   ```bash
   pm2 flush
   pm2 restart academyz
   pm2 logs academyz
   ```

---

**✅ Após executar os comandos, o servidor deve iniciar sem erros!**

**Commit no GitHub:** `20ddac5 - fix: Corrigir migrations para adicionar coluna duration`
