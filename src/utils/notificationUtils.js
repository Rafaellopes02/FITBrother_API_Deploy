const prisma = require('../prisma');
const admin = require('../config/firebaseConfig');

/**
 * Envia uma notificação para um utilizador específico (Grava na BD e envia o Push Real)
 * @param {number} userId - ID do utilizador que vai receber o alerta
 * @param {string} title - Título da notificação
 * @param {string} body - Mensagem detalhada
 * @param {string} type - Nome do enum ('WORKOUT', 'ASSESSMENT', 'MESSAGE', 'SYSTEM')
 */
const sendNotification = async (userId, title, body, type = 'SYSTEM') => {
  try {
    let notificationId = "chat_message"; // ID genérico para mensagens de chat
    let newNotification = null;

    // 1. SÓ grava no histórico da Base de Dados se NÃO for uma mensagem de chat
    if (type !== 'MESSAGE') {
      newNotification = await prisma.notification.create({
        data: {
          userId: parseInt(userId),
          title,
          body,
          type: type // 'WORKOUT', 'ASSESSMENT', 'SYSTEM'
        }
      });
      notificationId = newNotification.id.toString();
      console.log(`[Notification BD] Gravada para o User ${userId}: "${title}"`);
    } else {
      console.log(`[Notification BD] Ignorada gravação no histórico para o tipo MESSAGE (Chat).`);
    }

    // 2. Ir buscar todos os tokens ativos (O fluxo do Push continua igual para acordar o telemóvel)
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId: parseInt(userId) },
      select: { token: true }
    });

    if (deviceTokens.length === 0) {
      console.log(`[Notification Push] User ${userId} não tem nenhum telemóvel registado.`);
      return newNotification; // Retorna null ou o objeto criado
    }

    const tokensList = deviceTokens.map(t => t.token);
    console.log(`[Notification Push] Encontrados ${tokensList.length} dispositivos para o User ${userId}.`);

    // ─── ENVIO REAL DO PUSH VIA FIREBASE ADMİN ───────────────────────────────
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        type: type,
        notificationId: notificationId // Passa o ID real ou o marcador de chat
      },
      tokens: tokensList
    };

    // Dispara em lote para todos os dispositivos encontrados
    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`🚀 [Notification Push] Enviada via Firebase. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`);

    // Limpeza automática de tokens velhos/expirados
    if (response.failureCount > 0) {
      response.responses.forEach(async (resp, idx) => {
        if (!resp.success && (resp.error.code === 'messaging/invalid-registration-token' || resp.error.code === 'messaging/registration-token-not-registered')) {
          const tokenInvalido = tokensList[idx];
          await prisma.deviceToken.deleteMany({ where: { token: tokenInvalido } });
          console.log(`🧹 [Firebase] Token expirado limpo da Base de Dados do FITBrother.`);
        }
      });
    }

    return newNotification;

  } catch (error) {
    console.error('❌ Erro no helper de notificações:', error.message);
  }
};

module.exports = {
  sendNotification
};