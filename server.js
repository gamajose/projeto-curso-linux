require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();

// Rotas da API
const certificateRoutes = require("./src/routes/certificates");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const progressRoutes = require("./src/routes/progress");
const rankingRoutes = require("./src/routes/ranking");
const courseRoutes = require("./src/routes/courses");

// --- Configuração do Servidor para o Chat ---
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

app.set("trust proxy", 1);

const corsOptions = {
  origin: [
        'https://academyz.com.br',
        'https://www.academyz.com.br',
        'http://academyz.com.br',
        'http://www.academyz.com.br',
        'http://localhost:3001',
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rotas da API
app.use("/api/certificates", certificateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/courses", courseRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor está funcionando',
        timestamp: new Date().toISOString(),
        port: process.env.PORT
    });
});

app.options('*', cors(corsOptions));

// Servir páginas HTML
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

app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verify-public.html'));
});

app.get('/cursos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cursos.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
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

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faq.html'))
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'))
});


// Lógica do Chat com Socket.IO
io.on('connection', (socket) => {
    console.log('✅ Um usuário se conectou ao chat');

    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectado do chat');
    });

    // Ouve por mensagens do chat e retransmite para todos
    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3001;
const pool = require("./src/config/database");

async function startServer() {
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
        client.release();
        
        server.listen(PORT, () => {
            console.log(`✅ Servidor rodando na porta ${PORT}`);
            console.log(`📍 Acesse: http://academyz.com.br:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error.message, error.stack);
        process.exit(1);
    }
}

// async function startServer() {
//     try {
//         const client = await pool.connect();
//         console.log('✅ Conectado ao PostgreSQL com sucesso!');
//         client.release();
        
//         const templatePath = path.join(__dirname, 'certificates', 'templates', 'certificado-template.svg');
//         if (fs.existsSync(templatePath)) {
//             console.log('✅ Template encontrado em:', templatePath);
//         } else {
//             console.warn('⚠️ Template não encontrado em:', templatePath);
//         }
        
//         const server = app.listen(PORT, () => {
//             console.log(`✅ Servidor rodando na porta ${PORT}`);
//             console.log(`📍 Acesse: http://academyz.com.br:${PORT}`);
//         });

//         // Desligamento limpo do servidor (sem referências a serviços)
//         const shutdown = () => {
//             console.log('\n🛑 Desligando servidor...');
//             server.close(() => {
//                 console.log('✅ Servidor desligado');
//                 process.exit(0);
//             });
//         };

//         process.on('SIGINT', shutdown);
//         process.on('SIGTERM', shutdown);

//     } catch (error) {
//         console.error('❌ Erro ao iniciar o servidor:', error.message, error.stack);
//         process.exit(1);
//     }
// }

startServer();
