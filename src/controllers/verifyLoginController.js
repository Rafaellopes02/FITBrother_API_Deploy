const prisma = require('../prisma');
const { comparePassword } = require('../utils/passwordUtils');
const authenticateUtil = require('../utils/authenticateUtils.js');

const userTypeReverseMap = {
  'USER_TYPE_0': '0',
  'USER_TYPE_1': '1',
  'USER_TYPE_2': '2',
  'USER_TYPE_3': '3',
};

const verifyLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e Senha obrigatórios' });
  }

  try {
    // Buscar utilizador com Prisma
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Verificar se o utilizador está ativo
    if(user.isDeleted === true) {
      return res.status(403).json({ error: 'Utilizador Não existe' });
    }

    if (!user.passwordHash) {
      return res.status(403).json({ error: 'Utilizador não possui senha cadastrada' });
    }

    // Comparar password
    const passwordMatch = await comparePassword(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(403).json({ error: 'Senha incorreta' });
    }

    // Gerar Token de autenticação
    const accessToken = authenticateUtil.generateAccessToken({
      id: user.id,
      name: user.name,
      isAdmin: user.userType === 'USER_TYPE_0' || user.userType === 'USER_TYPE_1'
    });

    let extraData = {};

    if (user.userType === 'USER_TYPE_3') {
      const anamnesisData = await prisma.anamnesis.findFirst({
        where: { clientId: user.id },
        orderBy: { id: 'desc' },
        select: {
          weightKg: true,
          heightCm: true,
          age: true
        }
      });

      let age = anamnesisData?.age || null;
      if (!age && user.dateOfBirth) {
        const birthDate = new Date(user.dateOfBirth);
        age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      }

      extraData = {
        weight_kg: anamnesisData?.weightKg || null,
        height_cm: anamnesisData?.heightCm || null,
        age: age
      };

    } 
    // Se for Personal Trainer (USER_TYPE_1)
    else if (user.userType === 'USER_TYPE_1') {
      const clientsCount = await prisma.user.count({
        where: {
          parentUserId: user.id,
          userType: 'USER_TYPE_3'
        }
      });

      // Conta o total de treinos criados por este PT
      const workoutsCount = await prisma.workout.count({
        where: {
          trainerId: user.id
        }
      });

      extraData = {
        total_clients: clientsCount,
        total_workouts: workoutsCount
      };
    }

    // Resposta final
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      user_type: userTypeReverseMap[user.userType],
      ...extraData,
      token: accessToken,
      profile_image: user.profile_image

    });

  } catch (err) {
    console.error('Erro ao efetuar login:', err);
    return res.status(500).json({ error: 'Erro ao efetuar login' });
  }
};

module.exports = {
  verifyLogin
};
