# 📐 Sistema de Templates de Certificados - Academy Z

## 📋 Visão Geral

O sistema de certificados da Academy Z agora suporta **múltiplos templates personalizados** para diferentes áreas de conhecimento. Cada template possui design único, cores e elementos visuais específicos para sua área.

---

## 🎨 Templates Disponíveis

### 1. **cert-mod-linux** - Linux / TI / Infraestrutura
- **Ícone:** 🐧
- **Cores:** Verde tecnológico (#00ff88)
- **Ideal para:** Cursos de Linux, DevOps, Cloud, Infraestrutura
- **Elementos:** Grid tecnológico, estilo terminal
- **Arquivo:** `certificates/templates/cert-mod-linux.svg`

### 2. **cert-mod-programacao** - Programação & Desenvolvimento
- **Ícone:** 💻
- **Cores:** Roxo/Azul (#667eea, #764ba2)
- **Ideal para:** Python, JavaScript, Java, C++, Web Development
- **Elementos:** Código binário, símbolos de programação `{ } [ ] < > ( )`
- **Arquivo:** `certificates/templates/cert-mod-programacao.svg`

### 3. **cert-mod-marketing** - Marketing Digital
- **Ícone:** 📱
- **Cores:** Rosa/Roxo (#ff6b9d, #c471ed)
- **Ideal para:** Marketing Digital, Mídias Sociais, Growth
- **Elementos:** Círculos decorativos, gradientes vibrantes
- **Arquivo:** `certificates/templates/cert-mod-marketing.svg`

### 4. **cert-mod-design** - Design & Criatividade
- **Ícone:** 🎨
- **Cores:** Rosa/Laranja/Amarelo (#f093fb, #f5576c, #feca57)
- **Ideal para:** Design Gráfico, UI/UX, Ilustração, Photoshop
- **Elementos:** Formas geométricas, bordas criativas, paleta multicolorida
- **Arquivo:** `certificates/templates/cert-mod-design.svg`

### 5. **cert-mod-direito** - Direito & Legislação
- **Ícone:** ⚖️
- **Cores:** Marrom/Dourado (#8b5a3c, #d4a574)
- **Ideal para:** Direito Civil, Trabalhista, Tributário, OAB
- **Elementos:** Símbolos jurídicos (§, ⚖), tipografia formal Georgia serif
- **Arquivo:** `certificates/templates/cert-mod-direito.svg`

### 6. **cert-mod-administrativo** - Gestão & Administração
- **Ícone:** 📊
- **Cores:** Azul corporativo (#4a90e2, #357abd)
- **Ideal para:** Gestão, Administração, RH, Finanças
- **Elementos:** Formas geométricas, estilo corporativo clean
- **Arquivo:** `certificates/templates/cert-mod-administrativo.svg`

### 7. **cert-mod-geral** - Geral / Outros
- **Ícone:** 📜
- **Cores:** Azul claro (#00b4d8, #0077b6)
- **Ideal para:** Cursos diversos, workshops, palestras
- **Elementos:** Design simples e versátil
- **Arquivo:** `certificates/templates/cert-mod-geral.svg`

---

## 🔧 Como Usar no Painel Admin

### Passo 1: Acessar o Painel
```
URL: http://academyz.com.br/admin
Login: Apenas usuários com is_admin = true
```

### Passo 2: Preencher o Formulário
1. **Nome Completo:** Digite o nome do participante
2. **Nome do Curso:** Digite livremente o nome do curso (não há mais dropdown fixo)
3. **Modelo de Certificado:** Selecione o template apropriado
4. **Carga Horária:** Insira as horas (1-500)
5. **Modalidade:** Online, Presencial ou Híbrido
6. **Datas:** Emissão e Conclusão

### Passo 3: Emitir e Baixar
- Clique em **"🚀 Emitir Certificado"**
- Aguarde a confirmação (ID, Hash)
- Clique em **"📥 Baixar Certificado (PNG)"**
- Certificado pronto para compartilhar!

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `certificates`
```sql
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    participant_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    hours INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    completion_date DATE NOT NULL,
    certificate_id VARCHAR(50) UNIQUE NOT NULL,
    modalidade VARCHAR(100) DEFAULT 'Online',
    instrutor VARCHAR(255) DEFAULT 'José Moraes',
    diretor VARCHAR(255) DEFAULT 'Danilo Germano',
    organizacao VARCHAR(255) DEFAULT 'Academy Z',
    hash_verificacao VARCHAR(50) UNIQUE NOT NULL,
    template_type VARCHAR(50) DEFAULT 'cert-mod-linux',  -- NOVO CAMPO
    valido BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Nota:** Se a coluna `template_type` não existir, o sistema de migrations a adiciona automaticamente.

---

## 🔗 API - Emissão Manual de Certificados

### Endpoint: `POST /api/certificates/admin/create`

**Autenticação:** Bearer Token (is_admin = true)

**Body JSON:**
```json
{
  "participant_name": "João da Silva",
  "course_name": "Curso de Google Cloud Platform",
  "hours": 40,
  "modalidade": "Online",
  "issue_date": "2025-03-20",
  "completion_date": "2025-03-20",
  "template_type": "cert-mod-programacao"
}
```

**Resposta (201 Created):**
```json
{
  "id": 42,
  "certificate_id": "Cur2025-A3F8D1B2",
  "participant_name": "João da Silva",
  "course_name": "Curso de Google Cloud Platform",
  "hours": 40,
  "modalidade": "Online",
  "template_type": "cert-mod-programacao",
  "hash_verificacao": "1a2b3c4d5e6f7g8h",
  "issue_date": "2025-03-20",
  "completion_date": "2025-03-20",
  "valido": true,
  "download_count": 0,
  "created_at": "2025-03-20T15:30:00.000Z"
}
```

---

## 🖼️ Estrutura dos Templates SVG

### Placeholders Suportados
Todos os templates SVG devem usar os seguintes placeholders:

```svg
{{PARTICIPANT_NAME}}    <!-- Nome do participante -->
{{COURSE_NAME}}         <!-- Nome do curso -->
{{HOURS}}               <!-- Carga horária (ex: 40h) -->
{{COMPLETION_DATE}}     <!-- Data de conclusão formatada -->
{{MODALIDADE}}          <!-- Modalidade (Online/Presencial/Híbrido) -->
{{CERTIFICATE_ID}}      <!-- ID único do certificado -->
{{HASH}}                <!-- Hash de verificação -->
{{QR_CODE}}             <!-- Bloco SVG do QR Code -->
```

### Exemplo de Template SVG
```svg
<text x="700" y="385" font-size="42" fill="#2d3748" text-anchor="middle">
  {{PARTICIPANT_NAME}}
</text>

<text x="700" y="520" font-size="36" fill="#00b4d8" text-anchor="middle">
  {{COURSE_NAME}}
</text>

<g id="qrcode" transform="translate(1150, 740)">
  {{QR_CODE}}
</g>
```

---

## 🎯 Regras de Seleção de Template

### Escolha o template certo:

| **Área do Curso** | **Template Recomendado** |
|-------------------|--------------------------|
| Linux, DevOps, Cloud, Infraestrutura | `cert-mod-linux` 🐧 |
| Python, JavaScript, Java, C++, Web | `cert-mod-programacao` 💻 |
| Marketing, Mídias Sociais, Growth | `cert-mod-marketing` 📱 |
| Design, UI/UX, Photoshop, Ilustração | `cert-mod-design` 🎨 |
| Direito, OAB, Legislação | `cert-mod-direito` ⚖️ |
| Gestão, RH, Administração, Finanças | `cert-mod-administrativo` 📊 |
| Cursos gerais, Workshops | `cert-mod-geral` 📜 |

---

## 🔐 Segurança

### Controle de Acesso Admin
- Apenas usuários com `is_admin = true` podem emitir certificados manualmente
- Token JWT é obrigatório em todas as requisições ao endpoint `/api/certificates/admin/create`
- Verificação automática na página `/admin` - redireciona não-admins para `/home`

### Como Tornar um Usuário Admin
```sql
-- Na VM, conectar ao PostgreSQL
psql -h 192.168.3.31 -U jose -d curso

-- Tornar admin
UPDATE users SET is_admin = true WHERE email='seu_email@example.com';

-- Verificar
SELECT id, name, email, is_admin FROM users WHERE is_admin = true;
```

---

## 🚀 Deploy e Atualização

### Na VM Linux

1. **Atualizar código:**
```bash
cd /mnt/Projetos/projeto-curso-linux
git pull origin main
```

2. **Instalar dependências (se houver novas):**
```bash
npm install
```

3. **Reiniciar servidor:**
```bash
pm2 restart academyz
pm2 logs academyz --lines 30
```

4. **Verificar logs:**
- Migrations devem rodar automaticamente
- A coluna `template_type` será adicionada se não existir
- Templates SVG devem ser encontrados em `/certificates/templates/`

### Verificar Templates
```bash
ls -lh /mnt/Projetos/projeto-curso-linux/certificates/templates/
```

Deve listar:
```
cert-mod-linux.svg
cert-mod-programacao.svg
cert-mod-marketing.svg
cert-mod-design.svg
cert-mod-direito.svg
cert-mod-administrativo.svg
cert-mod-geral.svg
Joseluiz.png
danilo.png
```

---

## 📝 Exemplo de Uso Completo

### Cenário: Emitir certificado de curso de Marketing

1. **Login Admin:** `http://academyz.com.br/admin-login`
2. **Preencher:**
   - Nome: "Maria Santos"
   - Curso: "Marketing Digital Avançado"
   - Template: `📱 Marketing Digital`
   - Horas: 30
   - Modalidade: Online
   - Datas: 20/03/2025
3. **Emitir:** Clique em "🚀 Emitir Certificado"
4. **Resultado:**
   - ID: `Mar2025-F3A8D1B2`
   - Hash: `a1b2c3d4e5f6g7h8`
   - URL: `academyz.com.br/verificar/a1b2c3d4e5f6g7h8`
5. **Baixar:** PNG pronto com cores rosa/roxo (#ff6b9d, #c471ed)
6. **Verificar:** QR Code funcional aponta para verificação

---

## 🐛 Troubleshooting

### Template não encontrado
```
⚠️ Template cert-mod-xxx.svg não encontrado, usando cert-mod-linux.svg
```

**Solução:** Verifique se o arquivo existe em `certificates/templates/`

### Coluna template_type não existe
```
❌ Erro: column "template_type" of relation "certificates" does not exist
```

**Solução:**
```bash
# Forçar migrations
cd /mnt/Projetos/projeto-curso-linux
npm run migrate
pm2 restart academyz
```

### Certificado não gera imagem
```
❌ Erro ao gerar a imagem a partir do SVG
```

**Solução:**
- Verificar se `sharp` está instalado: `npm install sharp`
- Verificar permissões da pasta `certificates/templates/`
- Verificar logs com `pm2 logs academyz`

---

## 📚 Documentos Relacionados

- `SEGURANCA_ADMIN.md` - Sistema de autenticação admin
- `GUIA_ADMIN.md` - Guia completo do painel administrativo
- `IMPLEMENTACOES.md` - Histórico de implementações
- `MIGRATIONS.md` - Sistema de migrations automáticas

---

## 🎉 Conclusão

O sistema de templates permite:
- ✅ **7 templates personalizados** para diferentes áreas
- ✅ **Campo de curso editável** (texto livre)
- ✅ **Seleção visual no admin** com ícones e descrições
- ✅ **Geração automática** de certificados em PNG
- ✅ **QR Code único** por certificado
- ✅ **URL de verificação** com hash único
- ✅ **Segurança admin** com JWT
- ✅ **Migrations automáticas** - adiciona coluna template_type

---

**Desenvolvido para Academy Z**  
**Data:** Março 2025  
**Versão:** 2.0 - Sistema Multi-Templates
