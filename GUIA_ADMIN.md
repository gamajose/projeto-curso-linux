# 🔧 Guia Completo - Painel de Administração

## 🎯 Como Acessar o Painel Admin

### 1️⃣ **Certifique-se que o Servidor Está Rodando**

```bash
# Ver status
pm2 list

# Se não estiver rodando, iniciar
pm2 start ecosystem.config.cjs

# Ver logs para confirmar que iniciou sem erros
pm2 logs academyz --lines 30
```

**Você deve ver:**
```
✅ Servidor rodando na porta 3001
```

---

### 2️⃣ **Acesse o Painel Admin**

**URL:** `http://academyz.com.br/admin`

**OU** (se estiver testando localmente):
- `http://localhost:3001/admin`
- `http://192.168.3.31:3001/admin`

---

## 🖥️ Interface do Painel Admin

### **Campos do Formulário:**

1. **Nome Completo do Participante** *
   - Ex: `João Silva`

2. **Nome do Curso** * (Dropdown)
   - Curso de Linux
   - Curso de GCP
   - Curso de AWS
   - Curso de Azure
   - Curso de DevOps
   - Curso de Docker
   - Curso de Kubernetes

3. **Carga Horária (horas)** *
   - Ex: `20`, `40`, `80`

4. **Modalidade** *
   - Online
   - Presencial
   - Híbrido

5. **Data de Emissão** *
   - Data de hoje (pré-preenchida)

6. **Data de Conclusão** *
   - Data de hoje (pré-preenchida)

---

## ✅ Como Emitir um Certificado Manualmente

### **Passo a Passo:**

1. **Faça Login no Sistema**
   - Acesse: `http://academyz.com.br/`
   - Faça login com suas credenciais

2. **Acesse o Painel Admin**
   - URL: `http://academyz.com.br/admin`

3. **Preencha o Formulário**
   ```
   Nome: João da Silva
   Curso: Curso de GCP
   Carga Horária: 40
   Modalidade: Online
   Data Emissão: 2025-03-20
   Data Conclusão: 2025-03-20
   ```

4. **Clique em "🚀 Emitir Certificado"**

5. **Aguarde o Processamento** (alguns segundos)

6. **Visualize o Preview do Certificado**
   - ID do Certificado: `CUR2025-ABC12345`
   - Nome do participante
   - Curso
   - Carga horária
   - Data de conclusão
   - **Hash de Verificação:** `1a2b3c4d5e6f7g8h`
   - **URL de Verificação:** `http://academyz.com.br/verificar/1a2b3c4d5e6f7g8h`

7. **Baixar o Certificado**
   - Clique em "📥 Baixar Certificado (PNG)"
   - O certificado será salvo como: `certificado-CUR2025-ABC12345.png`

8. **Compartilhar com o Participante**
   - Envie o arquivo PNG por email
   - Envie o link de verificação
   - O participante pode escanear o QR Code no certificado

---

## 🎨 Preview do Certificado Emitido

Após emitir, você verá:

```
✅ Certificado Emitido com Sucesso!

ID do Certificado: CUR2025-ABC12345
Participante: João da Silva
Curso: Curso de GCP
Carga Horária: 40h
Data de Conclusão: 20/03/2025
Hash de Verificação: 1a2b3c4d5e6f7g8h
URL de Verificação: http://academyz.com.br/verificar/1a2b3c4d5e6f7g8h

[📥 Baixar Certificado (PNG)]  [➕ Emitir Novo Certificado]
```

---

## 🔍 Verificar Certificado Emitido

### **Opção 1: Escanear QR Code**
- Use qualquer leitor de QR Code no celular
- Aponte para o QR Code no certificado
- Será redirecionado para: `academyz.com.br/verificar/{hash}`
- Certificado será validado automaticamente

### **Opção 2: URL Direta**
- Acesse: `http://academyz.com.br/verificar/1a2b3c4d5e6f7g8h`
- Substitua `1a2b3c4d5e6f7g8h` pelo hash real do certificado

### **Opção 3: Página de Verificação**
- Acesse: `http://academyz.com.br/verificar`
- Digite o ID do certificado: `CUR2025-ABC12345`
- Clique em "Verificar"

---

## 🛡️ Segurança e Autenticação

### **Importante:**
Atualmente, a página `/admin` está acessível sem autenticação. Recomendo adicionar proteção:

**Opção 1: Adicionar Middleware de Autenticação (Recomendado)**
```javascript
// No server.js
app.get('/admin', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
```

**Opção 2: Verificar is_admin no Frontend**
```javascript
// No admin.html, adicionar verificação
const user = await fetch('/api/users/me', {
    headers: { 'Authorization': `Bearer ${token}` }
});

if (!user.is_admin) {
    alert('Acesso negado! Apenas administradores.');
    window.location.href = '/';
}
```

---

## 📊 Dados do Certificado Gerado

### **Informações no Banco de Dados:**
```sql
SELECT * FROM certificates WHERE certificate_id = 'CUR2025-ABC12345';
```

**Campos:**
- `id`: ID interno (auto-incremento)
- `participant_name`: João da Silva
- `course_name`: Curso de GCP
- `hours`: 40
- `certificate_id`: CUR2025-ABC12345 (único)
- `hash_verificacao`: 1a2b3c4d5e6f7g8h (único, 16 chars)
- `issue_date`: 2025-03-20
- `completion_date`: 2025-03-20
- `modalidade`: Online
- `instrutor`: José Moraes
- `organizacao`: Academy Z
- `valido`: true
- `download_count`: contador de downloads

---

## 🖼️ Template do Certificado

### **Características:**
✅ **Assinatura:** Apenas José Moraes (centralizado)
✅ **Organização:** Academy Z
✅ **QR Code:** Aponta para `academyz.com.br/verificar/{hash}`
✅ **URL de Verificação:** Exibida no certificado
✅ **Dados Dinâmicos:**
- Nome do participante
- Nome do curso
- Carga horária
- Data de conclusão
- Modalidade
- Hash de verificação

---

## 🚀 Testes Rápidos

### **Teste 1: Acessar Admin**
```bash
curl -I http://localhost:3001/admin
# Deve retornar: HTTP/1.1 200 OK
```

### **Teste 2: Emitir Certificado via API**
```bash
TOKEN="seu-token-jwt"

curl -X POST http://localhost:3001/api/certificates/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "participant_name": "João Silva",
    "course_name": "Curso de GCP",
    "hours": 40,
    "modalidade": "Online",
    "issue_date": "2025-03-20",
    "completion_date": "2025-03-20"
  }'
```

### **Teste 3: Verificar por Hash**
```bash
curl http://localhost:3001/api/certificates/verify-hash/1a2b3c4d5e6f7g8h
```

---

## ❌ Problemas Comuns

### **1. Página /admin não carrega**
**Solução:**
```bash
# Verificar se o servidor está rodando
pm2 list

# Ver logs
pm2 logs academyz

# Verificar porta
netstat -tlnp | grep 3001

# Testar rota
curl -I http://localhost:3001/admin
```

### **2. Erro ao emitir certificado**
**Solução:**
```bash
# Ver logs em tempo real
pm2 logs academyz --lines 50

# Verificar tabela certificates existe
psql -h 192.168.3.31 -U jose -d curso -c "\d certificates"

# Executar migrations
npm run migrate
```

### **3. Download do certificado falha**
**Solução:**
```bash
# Verificar se sharp está instalado
npm list sharp

# Reinstalar sharp
npm install --os=linux --cpu=x64 sharp

# Verificar template SVG existe
ls -lh certificates/templates/certificado-template.svg

# Verificar imagens de assinatura
ls -lh certificates/templates/*.png
```

---

## 📋 Checklist de Funcionalidades

- [ ] Consegue acessar `http://academyz.com.br/admin`
- [ ] Formulário carrega corretamente
- [ ] Todos os campos estão visíveis
- [ ] Dropdown de cursos funciona
- [ ] Consegue preencher todos os campos
- [ ] Botão "Emitir Certificado" funciona
- [ ] Preview do certificado aparece
- [ ] Hash de verificação é exibido
- [ ] URL de verificação está correta
- [ ] Download do PNG funciona
- [ ] Certificado tem QR Code
- [ ] QR Code aponta para URL correta
- [ ] Verificação por hash funciona
- [ ] Escanear QR Code funciona

---

## 🎯 Próximos Passos (Melhorias Sugeridas)

### **1. Adicionar Autenticação**
```javascript
// Proteger rota /admin
app.get('/admin', authenticateToken, checkIsAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
```

### **2. Adicionar Lista de Certificados Emitidos**
```javascript
// Página para listar todos os certificados
app.get('/admin/certificados', (req, res) => {
    // Lista com filtros, busca, paginação
});
```

### **3. Adicionar Edição de Certificados**
```javascript
// Editar certificado existente
app.put('/api/certificates/:id', (req, res) => {
    // Atualizar dados
});
```

### **4. Adicionar Invalidação de Certificados**
```javascript
// Invalidar certificado
app.patch('/api/certificates/:id/invalidate', (req, res) => {
    // Marcar como inválido
});
```

---

## ✅ Resumo

**A página `/admin` já está criada e funcional!**

1. ✅ Arquivo: `public/admin.html` (19KB)
2. ✅ Rota: `app.get('/admin')` configurada
3. ✅ API: `POST /api/certificates/admin/create`
4. ✅ Formulário completo com todos os campos
5. ✅ Preview do certificado emitido
6. ✅ Download em PNG
7. ✅ Hash único gerado
8. ✅ QR Code dinâmico

**Acesse agora:**
```
http://academyz.com.br/admin
```

**OU**
```
http://192.168.3.31:3001/admin
```

---

**Se tiver algum problema ao acessar, me avise! 🚀**
