require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

const certificateRoutes = require("./src/routes/certificates");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const progressRoutes = require("./src/routes/progress");
const rankingRoutes = require("./src/routes/ranking");
const courseRoutes = require("./src/routes/courses");

app.set('trust proxy', 1);

// Configure CORS
const corsOptions = {
    origin: [
        'https://academyz.com.br',
        'https://www.academyz.com.br',
        'http://academyz.com.br',
        'http://www.academyz.com.br',
        'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Rotas
app.use('/api/certificates', certificateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/courses', courseRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor está funcionando',
        timestamp: new Date().toISOString(),
        port: process.env.PORT
    });
});


// Handle preflight requests
app.options('*', cors(corsOptions));

// Servir páginas diferentes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/recover', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recover.html'));
});
    
app.get('/reset', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/verificar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verificar.html'));
});

app.get('/verificar/:hash', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verificar.html'));
});

app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verify-public.html'));
});

app.get('/cursos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cursos.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/change-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'change-password.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/faq', (req, res) => res.sendFile(path.join(__dirname, 'public', 'faq.html')));

let messageHistory = [];
io.on('connection', (socket) => {
    socket.emit('chat history', messageHistory);
    socket.on('chat message', (data) => {
        const message = { ...data, timestamp: new Date() };
        messageHistory.push(message);
        if (messageHistory.length > 100) messageHistory.shift();
        io.emit('chat message', message);
    });
});

app.post("/api/chat/ask-local", (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: "Pergunta não fornecida." });
    }

    try {
        const faqContent = fs.readFileSync(path.join(__dirname, 'public', 'faq.html'), 'utf8');
        
        // Extrai as perguntas e respostas do HTML do FAQ
        const faqs = [];
        const detailsRegex = /<details>.*?<summary>(.*?)<\/summary>.*?<p>(.*?)<\/p>.*?<\/details>/gs;
        let match;
        while ((match = detailsRegex.exec(faqContent)) !== null) {
            faqs.push({ question: match[1].trim(), answer: match[2].trim() });
        }

        // Lógica simples de busca por palavras-chave
        const questionWords = question.toLowerCase().split(/\s+/);
        let bestMatch = { score: 0, answer: "Desculpe, não encontrei uma resposta para sua pergunta no nosso FAQ. Tente perguntar de outra forma." };

        faqs.forEach(faq => {
            let score = 0;
            questionWords.forEach(word => {
                if (word.length > 2 && faq.question.toLowerCase().includes(word)) {
                    score++;
                }
            });
            if (score > bestMatch.score) {
                bestMatch = { score, answer: faq.answer };
            }
        });

        // Envia a resposta do "bot" para todos no chat
        io.emit('chat message', {
            userId: 'faq-bot',
            username: 'Assistente FAQ',
            avatar: 'https://i.imgur.com/832W43Q.png', // URL de um ícone de robô/ajuda
            text: bestMatch.answer
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Erro ao processar pergunta do FAQ:", error);
        res.status(500).json({ error: "Erro interno ao buscar resposta." });
    }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3001;
const pool = require('./src/config/database');
const DatabaseMigrations = require('./src/config/migrations');

async function startServer() {
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
        client.release();

        // Executar migrations automáticas
        console.log('\n🔧 Verificando estrutura do banco de dados...');
        await DatabaseMigrations.runAll();
        console.log('✅ Banco de dados pronto!\n');
        
        const templatePath = path.join(__dirname, 'certificates', 'templates', 'certificado-template.svg');
        if (fs.existsSync(templatePath)) {
            console.log('✅ Template encontrado em:', templatePath);
        } else {
            console.warn('⚠️ Template não encontrado em:', templatePath);
        }
        
        server.listen(PORT, () => {
            console.log(`✅ Servidor rodando na porta ${PORT}`);
            console.log(`📍 Acesse: http://academyz.com.br:${PORT}`);
        });

        // Desligamento limpo do servidor (sem referências a serviços)
        const shutdown = () => {
            console.log('\n🛑 Desligando servidor...');
            server.close(() => {
                console.log('✅ Servidor desligado');
                process.exit(0);
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error.message, error.stack);
        process.exit(1);
    }
}

startServer();
