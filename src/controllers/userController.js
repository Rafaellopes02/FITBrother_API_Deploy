const prisma = require('../prisma');
const { Prisma } = require('@prisma/client');
const crypto = require('crypto');
const { hashPassword } = require('../utils/passwordUtils');
const { hashRegisterCode } = require('../utils/registerCodeUtils');

const userTypeMap = {
  '0': 'USER_TYPE_0',
  '1': 'USER_TYPE_1',
  '2': 'USER_TYPE_2',
  '3': 'USER_TYPE_3',
};

const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    confirm_password,
    phone,
    user_type,
    parent_user_id,
    date_of_birth
  } = req.body;

  // --- Validações ---
  if (!name || !email || !password || !confirm_password || typeof user_type === 'undefined') {
    return res.status(400).json({
      message: 'Nome, email, password, confirmação de password e tipo de utilizador são obrigatórios.'
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: 'As passwords não coincidem.' });
  }

  const prismaUserType = userTypeMap[String(user_type)];
  if (!prismaUserType) {
    return res.status(400).json({ message: 'Tipo de utilizador inválido.' });
  }
  
  if ((prismaUserType === 'USER_TYPE_1' || prismaUserType === 'USER_TYPE_2') && !parent_user_id) {
    return res.status(400).json({ message: 'parent_user_id é obrigatório para Cliente ou Trainer.' });
  }

  try {
    const password_hash = await hashPassword(password);
    const plain_registration_code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const registration_code_hash = await hashRegisterCode(plain_registration_code);

    const newUser = await prisma.user.create({
      data: {
        registrationCode: registration_code_hash,
        registrationStatus: false,
        name: name,
        email: email,
        passwordHash: password_hash,
        phone: phone || null, 
        userType: prismaUserType,
        parentUserId: parent_user_id ? parseInt(parent_user_id) : (prismaUserType === 'USER_TYPE_0' ? 0 : null),
        dateOfBirth: date_of_birth ? new Date(date_of_birth) : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        registrationStatus: true,
        parentUserId: true,
        dateOfBirth: true,
        profile_image: true,
      }
    });

    return res.status(201).json({
      message: 'Utilizador criado com sucesso!',
      user: newUser,
      registration_code: plain_registration_code
    });

  } catch (err) {
    console.error('Erro ao criar utilizador:', err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const target = err.meta.target.join(', ');
      return res.status(409).json({ message: `O campo '${target}' já está registado.` });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        return res.status(400).json({ message: 'O treinador (parent_user_id) não foi encontrado.' });
    }
    return res.status(500).json({ message: 'Erro interno ao criar utilizador.' });
  }
};

const getUsersByParentId = async (req, res) => {
  const { parent_user_id } = req.params;

  if (!parent_user_id) {
    return res.status(400).json({ message: 'Parâmetro parent_user_id é obrigatório' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        parentUserId: parseInt(parent_user_id),
        userType: 'USER_TYPE_3' 
      },
      orderBy: {
        name: 'asc'
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isDeleted: true,
        profile_image: true,
        
        clientAnamnesis: { 
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            goals: true
          }
        },

        assignedWorkouts: {
          select: {
            date: true,      
            workoutId: true,
            status: true
          },
          orderBy: {
            date: 'asc'
          }
        }
      }
    });

    return res.status(200).json({ users: users });

  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    return res.status(500).json({ message: 'Erro ao buscar lista de clientes.' });
  }
};

module.exports = { getUsersByParentId };


// --- FUNÇÃO updateUser TOTALMENTE ATUALIZADA ---
const updateUser = async (req, res) => {
  const {
    id,
    name,
    email,
    phone,
    date_of_birth,
    password,
    confirm_password,
    registration_status,
    emergency_name,
    emergency_phone,
    user_type
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID do utilizador é obrigatório para atualização.' });
  }

  try {
    let password_hash = null;

    if (password || confirm_password) {
      if (!password || !confirm_password) {
        return res.status(400).json({ message: 'Ambas as passwords devem ser preenchidas.' });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ message: 'As passwords não coincidem.' });
      }
      password_hash = await hashPassword(password);
    }

    const dataToUpdate = {
      name,
      email,
      phone: phone ? BigInt(phone) : null,
      dateOfBirth: date_of_birth ? new Date(date_of_birth) : null,
      registrationStatus: registration_status ?? undefined,
      emergency_name,
      emergency_phone,
      ...(password_hash && { passwordHash: password_hash }),
    };

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    const successMessage = password_hash
      ? 'Utilizador e password atualizados com sucesso'
      : 'Utilizador atualizado com sucesso';

    return res.status(200).json({
      message: successMessage,
      user: updatedUser,
    });

  } catch (err) {
    if (err instanceof Prisma.PrismaClientValidationError) {
      console.warn('Erro de validação do Prisma:', err.message);
      return res.status(400).json({ message: 'Dados inválidos. Verifique os campos preenchidos.' });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const target = err.meta?.target?.join(', ') || '';
        if (target.includes('email'))
          return res.status(409).json({ message: `O email '${req.body.email}' já está registado.` });
        if (target.includes('phone'))
          return res.status(409).json({ message: `O telefone '${req.body.phone}' já está registado.` });
      }

      if (err.code === 'P2025') {
        return res.status(404).json({ message: 'Utilizador não encontrado.' });
      }
    }

    console.error('Erro 500 não tratado no updateUser:', err);
    return res.status(500).json({ message: 'Erro interno da API ao atualizar utilizador.' });
  }
};


const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Parâmetro ID é obrigatório' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        clientAnamnesis: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    if (user.clientAnamnesis && user.clientAnamnesis.length > 0) {
      const anamnesis = user.clientAnamnesis[0];
      
      // Mapear género (GENDER_1 -> 1) se necessário, ou enviar como está
      user.gender = anamnesis.gender; 
      user.height = anamnesis.heightCm;
      user.weight = anamnesis.weightKg;
      user.fitness_level = anamnesis.activityLevel;
      user.objectives = anamnesis.goals; 
    }

    return res.status(200).json({ user: user });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar utilizador por ID' });
  }
};

const deleteUserById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID do utilizador é obrigatório.' });
  }

  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return res.status(400).json({ message: 'O ID do utilizador deve ser um número.' });
  }

  try {
    await prisma.user.update({
      where: { id: numericId },
      data: { isDeleted: true }
    });

    return res.status(200).json({ message: 'Utilizador apagado com sucesso.' });

  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao apagar utilizador.' });
  }
};

const reactivateUserById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID do utilizador é obrigatório.' });
  }

  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return res.status(400).json({ message: 'O ID do utilizador deve ser um número.' });
  }

  try {
    const reactivatedUser = await prisma.user.update({
      where: { id: numericId },
      data: { isDeleted: false }
    });

    return res.status(200).json({ 
      message: 'Utilizador reativado com sucesso.',
      user: reactivatedUser
    });

  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao reativar utilizador.' });
  }
};

// --- NOVA FUNÇÃO: Estatísticas do Dashboard ---

const getTrainerDashboardStats = async (req, res) => {
  const { trainer_id } = req.params;

  if (!trainer_id) {
    return res.status(400).json({ message: 'ID do treinador é obrigatório' });
  }

  try {
    const id = parseInt(trainer_id);
    
    // --- 1. DEFINIÇÃO DE DATAS (UTC) ---
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const tomorrowStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    
    // --- 2. DADOS PRINCIPAIS (Estes funcionam sempre) ---
    
    // A. Clientes Ativos
    const activeClientsCount = await prisma.user.count({
      where: { parentUserId: id, userType: 'USER_TYPE_3', isDeleted: false }
    });

    // B. Treinos de Hoje (Baseado na tua correção anterior)
    const workoutsTodayCount = await prisma.workoutClient.count({
      where: {
        client: { parentUserId: id },
        date: { gte: todayStart, lt: tomorrowStart }
      }
    });

    // C. Taxa de Conclusão Global
    const totalAssignments = await prisma.workoutClient.count({
      where: { client: { parentUserId: id } }
    });
    const completedAssignments = await prisma.workoutClient.count({
      where: { client: { parentUserId: id }, status: 'WORKOUT_STATUS_2' }
    });
    const overallRate = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100) 
      : 0;


    // --- 3 CÁLCULO DE CRESCIMENTO (BLOCO SEGURO) ---
    let growthActive = 0;
    let growthWorkouts = 0;
    let growthRate = 0;

    try {
      // Datas Auxiliares
      const yesterdayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1));
      const oneWeekAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7));
      const twoWeeksAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 14));

      // 3.1. Growth Workouts (Hoje vs Ontem)
      const workoutsYesterdayCount = await prisma.workoutClient.count({
        where: {
          client: { parentUserId: id },
          date: { gte: yesterdayStart, lt: todayStart }
        }
      });
      growthWorkouts = workoutsTodayCount - workoutsYesterdayCount;

      // 3.2. Growth Clientes (Requer createdAt/updatedAt no User)
      // Se o teu Schema não tiver createdAt, isto vai falhar, mas o catch apanha
      const newClientsWeek = await prisma.user.count({
        where: { parentUserId: id, created_at: { gte: oneWeekAgo } }
      });
      const deletedClientsWeek = await prisma.user.count({
        where: {
  parentUserId: id,
  created_at: { gte: oneWeekAgo }
}
      });
      growthActive = newClientsWeek - deletedClientsWeek;

      // 3.3. Growth Rate (Semana vs Semana Anterior)
      const getRate = async (start, end) => {
        const t = await prisma.workoutClient.count({ where: { client: { parentUserId: id }, date: { gte: start, lt: end } } });
        const c = await prisma.workoutClient.count({ where: { client: { parentUserId: id }, status: 'WORKOUT_STATUS_2', date: { gte: start, lt: end } } });
        return t > 0 ? (c / t) * 100 : 0;
      };
      
      const rateThisWeek = await getRate(oneWeekAgo, tomorrowStart);
      const rateLastWeek = await getRate(twoWeeksAgo, oneWeekAgo);
      growthRate = Math.round(rateThisWeek - rateLastWeek);

    } catch (growthError) {
      console.warn('Aviso: Não foi possível calcular o crescimento (verifique se tem createdAt/updatedAt no Schema).', growthError.message);
    }

    // --- 4. RESPOSTA FINAL ---
    return res.status(200).json({
      activeClients: activeClientsCount,
      workoutsToday: workoutsTodayCount,
      completionRate: overallRate,
      
      growthActive,
      growthWorkouts,
      growthRate
    });

  } catch (err) {
    console.error('Erro CRÍTICO no dashboard:', err);
    return res.status(500).json({ message: 'Erro ao carregar dashboard.' });
  }
};

const getTrainerSessions = async (req, res) => {
  const { trainerId } = req.params;
  const { date } = req.query;

  if (!trainerId) {
    return res.status(400).json({ message: 'Trainer ID is required' });
  }

  try {
    const id = parseInt(trainerId);
    
    // --- Lógica de Datas ---
    let startDate = new Date();
    let endDate = null;

    if (date === 'today') {
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
    } else {
        startDate = new Date();
    }
    
    // --- Construção da Query Dinâmica ---
    const whereClause = {
        workout: { trainerId: id },
        date: { gte: startDate }
    };

    if (endDate) {
        whereClause.date.lte = endDate;
    }
    
    // --- Query ---
    const sessions = await prisma.workoutClient.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, profile_image: true }
        },
        workout: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // --- Formatting ---
    const formattedSessions = sessions.map(session => ({
      id: session.workoutId + '-' + session.clientId + '-' + session.date.toISOString(),
      client_name: session.client.name,
      client_image: session.client.profile_image,
      workout_name: session.workout.name,
      scheduled_date: session.startTime || session.date,
      client_id: session.client.id,
      workout_id: session.workout.id,
      status: session.status
    }));

    return res.status(200).json(formattedSessions);

  } catch (err) {
    console.error('Error fetching trainer sessions:', err);
    return res.status(500).json({ message: 'Error fetching sessions' });
  }
};

module.exports = {
  createUser,
  updateUser,
  getUsersByParentId,
  getUserById,
  deleteUserById,
  reactivateUserById,
  getTrainerDashboardStats,
  getTrainerSessions
};