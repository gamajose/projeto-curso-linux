const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

class ImageService {
    constructor() {
        this.templatesDir = path.join(__dirname, '..', '..', 'certificates', 'templates');
        this.assinaturaJosePath = path.join(this.templatesDir, 'Joseluiz.png');
        this.assinaturaDaniloPath = path.join(this.templatesDir, 'danilo.png');
    }

    getTemplatePath(templateType) {
        // Define o arquivo de template baseado no tipo
        const templateFile = `${templateType || 'cert-mod-linux'}.svg`;
        const templatePath = path.join(this.templatesDir, templateFile);
        
        // Se o template não existir, usa o padrão
        if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️ Template ${templateFile} não encontrado, usando cert-mod-linux.svg`);
            return path.join(this.templatesDir, 'cert-mod-linux.svg');
        }
        
        return templatePath;
    }

    getImageAsBase64(filePath) {
        try {
            const file = fs.readFileSync(filePath);
            return `data:image/png;base64,${file.toString('base64')}`;
        } catch (error) {
            console.error(`❌ Erro ao ler o arquivo de imagem: ${filePath}`, error);
            return '';
        }
    }

    async generateCertificateImageFromData(certificateData) {
        console.log('🚀 Iniciando geração de imagem para:', certificateData.participant_name);
        console.log('📄 Template selecionado:', certificateData.template_type || 'cert-mod-linux');

        try {
            // Carrega o template correto
            const templatePath = this.getTemplatePath(certificateData.template_type);
            let svgContent = fs.readFileSync(templatePath, 'utf8');

            const assinaturaJoseBase64 = this.getImageAsBase64(this.assinaturaJosePath);
            const assinaturaDaniloBase64 = this.getImageAsBase64(this.assinaturaDaniloPath);
            const completionDate = new Date(certificateData.completion_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            const baseUrl = (process.env.APP_BASE_URL || '').replace(/\/$/, '');
            
            // URL do QR Code aponta para a página de verificação com o hash
            const qrCodeVerificationUrl = `${baseUrl}/verificar/${certificateData.hash_verificacao}`;

            // URL textual exibe o domínio sem protocolo
            const textVerificationUrl = 'academyz.com.br/verificar';
            
            console.log('Gerando QR Code localmente...');

            const qrCodeImageBase64 = await QRCode.toDataURL(qrCodeVerificationUrl, {
                width: 232,
                margin: 1,
                errorCorrectionLevel: 'H'
            });
            console.log('✅ QR Code gerado com sucesso.');

            const qrCodeBlock = `
                <rect x="0" y="0" width="280" height="280" rx="8" ry="8" fill="#0b1220" stroke="#1f2937"/>
                <image href="${qrCodeImageBase64}" x="24" y="24" width="232" height="232"/>
            `;

            const replacements = {
                '{{PARTICIPANT_NAME}}': certificateData.participant_name,
                '{{COURSE_NAME}}': certificateData.course_name,
                '{{HOURS}}': `${certificateData.hours}h`,
                '{{COMPLETION_DATE}}': completionDate,
                '{{MODALIDADE}}': certificateData.modalidade,
                '{{CERTIFICATE_ID}}': certificateData.certificate_id,
                '{{HASH}}': certificateData.hash_verificacao,
                '{{HASH_VERIFICACAO}}': certificateData.hash_verificacao,
                '{{IMAGEM_ASSINATURA_JOSE}}': assinaturaJoseBase64,
                '{{IMAGEM_ASSINATURA_DANILO}}': assinaturaDaniloBase64,
                '{{QR_CODE}}': qrCodeBlock,
                '{{QR_CODE_BLOCK}}': qrCodeBlock,
                '{{URL_VERIFICACAO}}': textVerificationUrl.replace(/^https?:\/\//, '')
            };

            for (const placeholder in replacements) {
                const regex = new RegExp(placeholder, 'g');
                svgContent = svgContent.replace(regex, replacements[placeholder]);
            }

            const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();

            console.log('✅ Imagem PNG gerada com sucesso! Tamanho:', pngBuffer.length, 'bytes');
            return pngBuffer;

        } catch (error) {
            console.error('❌ Erro detalhado ao gerar a imagem a partir do SVG:', error.message);
            throw error;
        }
    }
}

module.exports = new ImageService();