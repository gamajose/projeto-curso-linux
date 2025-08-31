const multer = require('multer');
const path = require('path');

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define a pasta onde os avatares serão salvos
        cb(null, path.join(__dirname, '../../public/uploads/avatars/'));
    },
    filename: function (req, file, cb) {
        // Cria um nome de arquivo único para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Por favor, envie apenas imagens.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB por imagem
    fileFilter: fileFilter
});

module.exports = upload;