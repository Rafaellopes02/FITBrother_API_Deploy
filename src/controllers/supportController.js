const nodemailer = require('nodemailer');

const sendReport = async (req, res) => {
  const { description, deviceModel, contactEmail } = req.body;
  const screenshot = req.file; // Vem do multer

  try {
    // 1. Configurar o Transporte (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tigasmelo1@gmail.com',
        pass: 'yhhi bxqq clry pwhr'
      }
    });

    // 2. Configurar o Email
    const mailOptions = {
      from: `"App Report" <fitbrother21@gmail.com>`,
      to: 'tigasmelo@hotmail.com',
      subject: `[Bug Report] ${deviceModel} `,
      attachments: [],
    text: `
  NOVO PEDIDO DE SUPORTE
  ID Referência: #${Date.now()}
  
  ------------------------------------------------
  RESUMO DO PROBLEMA:
  ${description}
  ------------------------------------------------

  METADADOS:
  • Email de Contacto: ${contactEmail}
  • Modelo do Dispositivo: ${deviceModel}
  • Plataforma: Mobile
  
  Por favor, verificar o anexo (screenshot) se disponível.
`,
    };

    // 3. Anexar imagem
    if (screenshot) {
      mailOptions.attachments.push({
        filename: screenshot.originalname,
        content: screenshot.buffer
      });
    }

    // 4. Enviar
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Email enviado com sucesso' });

  } catch (error) {
    console.error('Erro ao enviar email de suporte:', error);
    return res.status(500).json({ message: 'Erro ao enviar email' });
  }
};

module.exports = { sendReport };