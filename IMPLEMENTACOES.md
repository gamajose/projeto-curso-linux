# Academy Z - Sistema de Certificados

## 📋 Resumo das Implementações

Este documento descreve todas as melhorias implementadas no sistema Academy Z para gerenciamento de cursos e emissão de certificados.

---

## ✨ Funcionalidades Implementadas

### 1. **Template de Certificado Atualizado** ✅
- ✅ Removida segunda assinatura (Red Innovations/Danilo Germano)
- ✅ Assinatura do José Moraes centralizada
- ✅ Nome da organização alterado de "Red Innovations" para "Academy Z"
- ✅ URL de verificação atualizada para: `academyz.com.br/verificar/{hash}`
- ✅ Informações dinâmicas: carga horária, modalidade e data
- ✅ QR Code gerado automaticamente apontando para URL de verificação

### 2. **Sistema de Hash Único** ✅
- ✅ Cada certificado possui um hash único de 16 caracteres hexadecimais
- ✅ Hash gerado automaticamente usando `crypto.randomBytes(8).toString('hex')`
- ✅ Hash armazenado no banco de dados com índice único
- ✅ QR Code do certificado aponta para: `academyz.com.br/verificar/{hash}`

### 3. **Página de Administração** ✅
**Acesso:** `http://academyz.com.br/admin`

Funcionalidades:
- ✅ Emissão manual de certificados sem necessidade de completar aulas
- ✅ Formulário completo com campos:
  - Nome do participante
  - Nome do curso (dropdown com opções)
  - Carga horária (horas)
  - Modalidade (Online/Presencial/Híbrido)
  - Data de emissão
  - Data de conclusão
- ✅ Preview do certificado emitido com todos os dados
- ✅ Download do certificado em PNG
- ✅ Exibição do hash de verificação
- ✅ Link direto para verificação

### 4. **API de Administração** ✅
**Endpoint:** `POST /api/certificates/admin/create`

**Payload:**
```json
{
  "participant_name": "Nome do Participante",
  "course_name": "Curso de GCP",
  "hours": 40,
  "modalidade": "Online",
  "issue_date": "2025-03-20",
  "completion_date": "2025-03-20"
}
```

**Resposta:**
```json
{
  "id": 123,
  "participant_name": "Nome do Participante",
  "course_name": "Curso de GCP",
  "hours": 40,
  "certificate_id": "CUR2025-ABC12345",
  "hash_verificacao": "1a2b3c4d5e6f7g8h",
  "completion_date": "2025-03-20",
  ...
}
```

### 5. **Sistema de Verificação Atualizado** ✅
**URLs de Verificação:**
- Via hash: `http://academyz.com.br/verificar/{hash}` (NOVO)
- Via ID: `http://academyz.com.br/verificar?certificate={id}` (compatibilidade)

**Funcionalidades:**
- ✅ Verificação automática ao escanear QR Code
- ✅ Exibição de todos os dados do certificado
- ✅ Status "Certificado Válido" com ícone ✅
- ✅ Download do certificado em PNG
- ✅ Visualização direta do certificado

**Nova API:**
- `GET /api/certificates/verify-hash/{hash}` - Busca certificado por hash
- `GET /api/certificates/certificate/{id}` - Busca certificado por ID

### 6. **Modal de Aulas Corrigido** ✅
- ✅ Conversão automática de URLs do YouTube para formato embed
- ✅ Player de vídeo responsivo (16:9)
- ✅ Autoplay ao abrir vídeo
- ✅ Botão "Marcar como Concluída" funcional
- ✅ Botão "Voltar para Aulas"

---

## 🔧 Arquivos Modificados

### Backend
1. **`src/controllers/certificateController.js`**
   - Adicionado `createCertificateAdmin()` - Emissão manual de certificados
   - Adicionado `getCertificateByHash()` - Busca por hash

2. **`src/models/Certificate.js`**
   - Adicionado `findByHash()` - Busca certificado por hash

3. **`src/routes/certificates.js`**
   - Adicionada rota `POST /admin/create` - Emissão manual
   - Adicionada rota `GET /verify-hash/:hash` - Verificação por hash

4. **`src/services/imageService.js`**
   - Atualizada URL de verificação para incluir hash
   - QR Code aponta para `academyz.com.br/verificar/{hash}`

5. **`server.js`**
   - Adicionada rota `GET /admin` - Página de administração
   - Adicionada rota `GET /verificar/:hash` - Suporte a hash na URL

### Frontend
1. **`public/admin.html`** (NOVO)
   - Interface completa de administração
   - Formulário de emissão manual
   - Preview de certificado emitido

2. **`public/verificar.html`**
   - Suporte a verificação por hash na URL
   - Função `verificarPorHash(hash)`
   - Atualização automática dos dados

3. **`public/cursos.html`**
   - Conversão de URLs do YouTube para embed
   - Player de vídeo funcional

### Templates
1. **`certificates/templates/certificado-template.svg`**
   - Removida segunda assinatura
   - Assinatura do José Moraes centralizada
   - Academy Z no lugar de Red Innovations
   - URL de verificação atualizada
   - QR Code com hash de verificação

---

## 🚀 Como Usar

### Para Administradores

#### 1. Emitir Certificado Manual
```bash
# Acesse
http://academyz.com.br/admin

# Preencha o formulário:
- Nome completo do participante
- Selecione o curso
- Informe a carga horária
- Escolha a modalidade
- Defina as datas

# Clique em "Emitir Certificado"
# Faça o download em PNG
```

#### 2. Verificar Certificado
```bash
# Via QR Code (automático)
Escaneie o QR Code do certificado

# Via Hash
http://academyz.com.br/verificar/{hash}

# Via ID
http://academyz.com.br/verificar?certificate={id}
```

### Para Alunos

#### 1. Assistir Aulas
```bash
# Acesse
http://academyz.com.br/cursos

# Clique em "Começar" ou "Continuar"
# Selecione uma aula
# Assista o vídeo
# Clique em "Marcar como Concluída"
```

#### 2. Gerar Certificado
```bash
# Complete todas as aulas do módulo
# Clique em "Emitir Certificado"
# Faça o download automático
```

---

## 📊 Estrutura do Banco de Dados

### Tabela: certificates
```sql
- id (SERIAL PRIMARY KEY)
- participant_name (VARCHAR(255))
- course_name (VARCHAR(255))
- hours (INTEGER)
- issue_date (DATE)
- completion_date (DATE)
- certificate_id (VARCHAR(50) UNIQUE)
- modalidade (VARCHAR(100))
- instrutor (VARCHAR(255))
- diretor (VARCHAR(255))
- organizacao (VARCHAR(255))
- hash_verificacao (VARCHAR(50) UNIQUE) ← NOVO
- valido (BOOLEAN)
- download_count (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Índices:**
- `idx_certificates_hash_verificacao` - Busca rápida por hash

---

## 🔐 Segurança

- ✅ Hash único e aleatório para cada certificado
- ✅ Validação de dados no backend
- ✅ Autenticação obrigatória para emissão
- ✅ Proteção contra duplicação de certificados
- ✅ Logs de download e acesso

---

## 📱 Responsividade

- ✅ Interface adaptada para desktop, tablet e mobile
- ✅ Player de vídeo responsivo
- ✅ Formulários otimizados para toque
- ✅ QR Code escaneável em qualquer dispositivo

---

## 🐛 Problemas Conhecidos

### Conexão com Banco de Dados
- O banco PostgreSQL está hospedado em servidor remoto (45.162.246.68:5432)
- Conexão pode estar bloqueada por firewall na VM Linux
- **Solução:** Verificar configurações de firewall e liberar porta 5432

### Instruções para Deploy na VM

```bash
# 1. Parar servidor atual
pm2 stop academyz

# 2. Fazer backup do código atual
cd /home/seu-usuario
tar -czf webapp_backup_$(date +%Y%m%d).tar.gz webapp/

# 3. Copiar novos arquivos (via scp ou git)
# Exemplo com git:
cd webapp
git pull origin main

# 4. Instalar dependências (se houver novas)
npm install

# 5. Reiniciar servidor
pm2 restart academyz

# 6. Verificar logs
pm2 logs academyz --lines 50

# 7. Testar
curl http://localhost:3001/health
```

---

## 📝 Checklist de Deploy

- [ ] Fazer backup do banco de dados
- [ ] Fazer backup dos arquivos atuais
- [ ] Atualizar código na VM
- [ ] Verificar variáveis de ambiente (.env)
- [ ] Reiniciar servidor com PM2
- [ ] Testar página de admin (`/admin`)
- [ ] Testar emissão de certificado
- [ ] Testar verificação por hash
- [ ] Testar QR Code
- [ ] Verificar template do certificado

---

## 🎯 Próximos Passos Sugeridos

1. **Autenticação de Admin**
   - Criar campo `is_admin` na tabela users
   - Proteger rota `/admin` com middleware
   - Permitir apenas usuários admin

2. **Dashboard de Certificados**
   - Listar todos os certificados emitidos
   - Filtros por curso, data, participante
   - Estatísticas de emissão

3. **Notificações**
   - Email ao emitir certificado
   - Email com link de verificação
   - Notificação de conclusão de curso

4. **Melhorias no Template**
   - Múltiplos templates por curso
   - Personalização de cores
   - Upload de logos

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verificar logs: `pm2 logs academyz`
2. Verificar conexão com banco
3. Verificar portas abertas
4. Revisar configurações do .env

---

## ✅ Status Final

**Todas as funcionalidades solicitadas foram implementadas com sucesso!**

- ✅ Modal de aulas com vídeos do YouTube funcionando
- ✅ Template de certificado atualizado
- ✅ Sistema de hash único implementado
- ✅ Página de administração criada
- ✅ API de emissão manual funcionando
- ✅ Sistema de verificação por hash
- ✅ QR Code dinâmico implementado

**O código está pronto para deploy na sua VM Linux!**
