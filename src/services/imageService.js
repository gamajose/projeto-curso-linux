const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

class ImageService {
    constructor() {
        this.templatesDir = path.join(__dirname, '..', '..', 'certificates', 'templates');
        this.assinaturaJosePath = path.join(this.templatesDir, 'Joseluiz.png');
        this.defaultTemplate = 'certificado-template';
    }

    getTemplatePath(templateType) {
        const safeTemplateType = String(templateType || this.defaultTemplate).replace(/[^a-zA-Z0-9_-]/g, '');
        const templateFile = `${safeTemplateType || this.defaultTemplate}.svg`;
        const templatePath = path.join(this.templatesDir, templateFile);
        
        if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️ Template ${templateFile} não encontrado, usando ${this.defaultTemplate}.svg`);
            return path.join(this.templatesDir, `${this.defaultTemplate}.svg`);
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

    escapeXml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    async generateCertificateImageFromData(certificateData) {
        console.log('🚀 Iniciando geração de imagem para:', certificateData.participant_name);
        console.log('📄 Template selecionado:', certificateData.template_type || this.defaultTemplate);

        try {
            const templatePath = this.getTemplatePath(certificateData.template_type);
            let svgContent = fs.readFileSync(templatePath, 'utf8');

            const assinaturaJoseBase64 = this.getImageAsBase64(this.assinaturaJosePath);
            const completionDate = new Date(certificateData.completion_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const issueDate = new Date(certificateData.issue_date || certificateData.completion_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const participantName = this.escapeXml(certificateData.participant_name);
            const courseName = this.escapeXml(certificateData.course_name);
            const hoursText = this.escapeXml(`${certificateData.hours}h`);
            const modalidade = this.escapeXml(certificateData.modalidade || 'Online');
            const certificateId = this.escapeXml(certificateData.certificate_id);
            const hashVerificacao = this.escapeXml(certificateData.hash_verificacao);
            const completionDateText = this.escapeXml(completionDate);
            const issueDateText = this.escapeXml(issueDate);
            const instrutor = this.escapeXml(certificateData.instrutor || 'José Moraes');
            const organizacao = this.escapeXml(certificateData.organizacao || 'Academy Z');

            const baseUrl = (process.env.APP_BASE_URL || 'https://academyz.com.br').replace(/\/$/, '');
            const qrCodeVerificationUrl = `${baseUrl}/verificar/${certificateData.hash_verificacao}`;
            const textVerificationUrl = `${baseUrl.replace(/^https?:\/\//, '')}/verificar`;
            
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
                '{{PARTICIPANT_NAME}}': participantName,
                '{{NOME_DO_PARTICIPANTE}}': participantName,
                '{{COURSE_NAME}}': courseName,
                '{{NOME_DO_CURSO}}': courseName,
                '{{HOURS}}': hoursText,
                '{{CARGA_HORARIA}}': hoursText,
                '{{COMPLETION_DATE}}': completionDateText,
                '{{DATA_CONCLUSAO}}': completionDateText,
                '{{ISSUE_DATE}}': issueDateText,
                '{{DATA_EMISSAO}}': issueDateText,
                '{{MODALIDADE}}': modalidade,
                '{{CERTIFICATE_ID}}': certificateId,
                '{{ID_CERTIFICADO}}': certificateId,
                '{{HASH}}': hashVerificacao,
                '{{HASH_VERIFICACAO}}': hashVerificacao,
                '{{INSTRUTOR}}': instrutor,
                '{{ORGANIZACAO}}': organizacao,
                '{{IMAGEM_ASSINATURA_JOSE}}': assinaturaJoseBase64,
                '{{ASSINATURA_INSTRUTOR}}': assinaturaJoseBase64,
                '{{QR_CODE}}': qrCodeBlock,
                '{{QR_CODE_BLOCK}}': qrCodeBlock,
                '{{URL_VERIFICACAO}}': textVerificationUrl
            };

            for (const placeholder in replacements) {
                const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
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
