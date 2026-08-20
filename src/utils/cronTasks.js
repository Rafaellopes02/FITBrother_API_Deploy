const cron = require('node-cron');
const prisma = require('../prisma'); // Ajusta o caminho para o teu ficheiro do Prisma
const { sendNotification } = require('./notificationUtils');


// Roda todos os dias à meia-noite (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30); // Calcula 30 dias atrás

    const limpas = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: dataLimite } // lt = Less Than (Menor que há 30 dias)
      }
    });

    if (limpas.count > 0) {
      console.log(`🧹 [Cron Limpeza] Foram eliminadas ${limpas.count} notificações antigas do FITBrother.`);
    }
  } catch (error) {
    console.error('❌ Erro na limpeza automática de notificações:', error.message);
  }
});

/**
 * 1. LEMBRETE DE TREINO DIÁRIO (Todos os dias às 08:00 da manhã)
 * Padrão Cron: '0 8 * * *' (Minuto 0, Hora 8, Todos os dias)
 */
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ [Cron] A verificar treinos agendados para hoje...');
  try {
    const hoje = new Date();
    const inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
    const fimDia = new Date(hoje.setHours(23, 59, 59, 999));

    // Procura todos os treinos marcados para hoje que ainda não foram feitos (status 'WORKOUT_STATUS_0')
    const treinosDeHoje = await prisma.workoutClient.findMany({
      where: {
        date: { gte: inicioDia, lte: fimDia },
        status: 'WORKOUT_STATUS_0'
      },
      include: { workout: true }
    });

    for (const agendamento of treinosDeHoje) {
      await sendNotification(
        agendamento.clientId,
        'Dia de Treino! 🏋️‍♂️',
        `Não te esqueças que tens o treino "${agendamento.workout.name}" planeado para hoje. Foco nos objetivos!`,
        'WORKOUT'
      );
    }
    console.log(`✅ [Cron] Lembretes de treino enviados para ${treinosDeHoje.length} alunos.`);
  } catch (error) {
    console.error('❌ [Cron] Erro no lembrete de treino diário:', error.message);
  }
});

/**
 * 2. ALERTA DE INATIVIDADE PARA O PT (Todos os dias às 09:00 da manhã)
 * Avisa o PT se o aluno não treina (status_1) há mais de 7 dias
 */
cron.schedule('0 9 * * *', async () => {
  console.log('🕵️‍♂️ [Cron] A verificar alunos inativos...');
  try {
    const haUmaSemana = new Date();
    haUmaSemana.setDate(haUmaSemana.getDate() - 7);

    // 1. Ir buscar todos os alunos ativos no sistema
    const alunos = await prisma.user.findMany({
      where: { userType: 'USER_TYPE_3', isDeleted: false, registrationStatus: true }
    });

    for (const aluno of alunos) {
      // 2. Ver o último treino que ele realmente completou
      const ultimoTreinoFeito = await prisma.workoutClient.findFirst({
        where: {
          clientId: aluno.id,
          status: 'WORKOUT_STATUS_1' // Lembra-se que o teu '1' é o completo!
        },
        orderBy: { date: 'desc' }
      });

      // Se o último treino foi há mais de 7 dias (ou se nunca treinou e a conta tem mais de 7 dias)
      const dataReferencia = ultimoTreinoFeito ? ultimoTreinoFeito.date : aluno.created_at;
      
      if (dataReferencia && new Date(dataReferencia) < haUmaSemana && aluno.parentUserId) {
        await sendNotification(
          parseInt(aluno.parentUserId), // O PT recebe o aviso
          'Alerta de Inatividade! ⚠️',
          `O teu aluno ${aluno.name} não regista treinos há mais de uma semana. Que tal enviar-lhe uma mensagem?`,
          'SYSTEM'
        );
      }
    }
  } catch (error) {
    console.error('❌ [Cron] Erro no alerta de inatividade:', error.message);
  }
});

/**
 * 3. MENSAGEM MOTIVACIONAL SEMANAL (Todas as segundas-feiras às 07:30 da manhã)
 * Padrão Cron: '30 7 * * 1' (Minuto 30, Hora 7, Dia da semana 1 = Segunda-feira)
 */
cron.schedule('30 7 * * 1', async () => {
  console.log('🔥 [Cron] A enviar boosts motivacionais da semana...');
  try {
    const alunos = await prisma.user.findMany({
      where: { userType: 'USER_TYPE_3', isDeleted: false, registrationStatus: true },
      select: { id: true }
    });

    const frases = [
      "Nova semana, novas oportunidades. Dá o teu melhor hoje! 💪",
      "A consistência é a chave para o resultado que procuras. Vamos a isso! 🔥",
      "Não contes os dias, faz os dias contarem. Boa semana de treinos! 🏋️‍♂️"
    ];

    for (const aluno of alunos) {
      const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
      await sendNotification(
        aluno.id,
        'Nova Semana, Foco Renovado! 🚀',
        fraseAleatoria,
        'SYSTEM'
      );
    }
  } catch (error) {
    console.error('❌ [Cron] Erro na rotina motivacional:', error.message);
  }
});

console.log('🔄 [Cron Tasks] Tarefas agendadas carregadas com sucesso.');