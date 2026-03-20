# 🚀 Guia Rápido de Deploy - Academy Z

## Passos para Atualizar o Sistema na VM Linux

### 1️⃣ Fazer Backup
```bash
# Backup do banco de dados
pg_dump -h 45.162.246.68 -U jose -d curso > backup_curso_$(date +%Y%m%d).sql

# Backup dos arquivos
cd /home/seu-usuario
tar -czf webapp_backup_$(date +%Y%m%d).tar.gz webapp/
```

### 2️⃣ Atualizar Código
```bash
# Parar servidor
pm2 stop academyz

# Atualizar código (escolha um método)

# Opção A: Via Git (se configurado)
cd webapp
git pull origin main

# Opção B: Via arquivo (copiar do sandbox)
# Use scp ou outro método para copiar os arquivos atualizados
```

### 3️⃣ Instalar Dependências
```bash
cd webapp
npm install
```

### 4️⃣ Reiniciar Servidor
```bash
# Reiniciar com PM2
pm2 restart academyz

# OU iniciar se for primeira vez
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 5️⃣ Verificar
```bash
# Ver logs
pm2 logs academyz --lines 50

# Testar health check
curl http://localhost:3001/health

# Verificar porta
netstat -tlnp | grep 3001

# Testar página admin
curl -I http://localhost:3001/admin
```

---

## 🔍 Testes Essenciais

### Teste 1: Página de Admin
```bash
# Acesse no navegador
http://academyz.com.br/admin

# Deve exibir formulário de emissão de certificados
```

### Teste 2: Emitir Certificado Manual
1. Acesse `/admin`
2. Preencha:
   - Nome: "Teste Manual"
   - Curso: "Curso de GCP"
   - Carga Horária: 40
   - Modalidade: Online
   - Datas: Hoje
3. Clique em "Emitir Certificado"
4. Verifique o preview com hash
5. Baixe o certificado PNG

### Teste 3: Verificação por Hash
1. Copie o hash do certificado emitido
2. Acesse: `http://academyz.com.br/verificar/{hash}`
3. Deve mostrar "Certificado Válido" ✅
4. Todos os dados devem aparecer corretamente

### Teste 4: QR Code
1. Baixe o certificado PNG
2. Escaneie o QR Code com celular
3. Deve abrir: `academyz.com.br/verificar/{hash}`
4. Certificado deve ser validado automaticamente

### Teste 5: Aulas e Vídeos
1. Acesse `/cursos`
2. Clique em "Começar" em qualquer curso
3. Clique em uma aula
4. Vídeo do YouTube deve carregar e reproduzir
5. Botão "Marcar como Concluída" deve funcionar

---

## ⚠️ Problemas Comuns

### Problema: Servidor não inicia
```bash
# Verificar logs
pm2 logs academyz --lines 100

# Verificar conexão com banco
psql -h 45.162.246.68 -U jose -d curso -c "SELECT 1"

# Verificar .env
cat .env | grep DB_
```

### Problema: Porta 3001 ocupada
```bash
# Matar processo na porta
fuser -k 3001/tcp

# OU identificar e matar
lsof -ti:3001 | xargs kill -9
```

### Problema: Certificado não gera imagem
```bash
# Verificar template SVG existe
ls -lh certificates/templates/certificado-template.svg

# Verificar imagens de assinatura
ls -lh certificates/templates/*.png

# Verificar sharp instalado
npm list sharp
```

---

## 📋 Checklist de Validação

- [ ] Servidor iniciou sem erros
- [ ] Health check responde: `/health`
- [ ] Página admin carrega: `/admin`
- [ ] Formulário de emissão funciona
- [ ] Certificado é gerado com hash único
- [ ] QR Code é criado no certificado
- [ ] Verificação por hash funciona: `/verificar/{hash}`
- [ ] Template mostra apenas José Moraes centralizado
- [ ] Template mostra "Academy Z" no lugar de "Red Innovations"
- [ ] URL no certificado: `academyz.com.br/verificar/{hash}`
- [ ] Aulas carregam vídeos do YouTube
- [ ] Player de vídeo é responsivo
- [ ] Marcar aula como concluída funciona

---

## 🆘 Suporte de Emergência

### Reverter para Versão Anterior
```bash
# Restaurar backup
cd /home/seu-usuario
tar -xzf webapp_backup_YYYYMMDD.tar.gz

# Reiniciar
pm2 restart academyz
```

### Restaurar Banco de Dados
```bash
# Restaurar dump
psql -h 45.162.246.68 -U jose -d curso < backup_curso_YYYYMMDD.sql
```

---

## ✅ Conclusão

**Todos os arquivos modificados estão commitados no git.**

Para aplicar as mudanças na sua VM:
1. Faça backup
2. Atualize o código (git pull ou copie arquivos)
3. Reinicie o PM2
4. Teste todas as funcionalidades

**Sucesso! 🎉**
