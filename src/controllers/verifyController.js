const prisma = require('../prisma');
const { compareRegisterCode } = require('../utils/registerCodeUtils');

const verifyRegisterCode = async (req, res) => {
  const { plain_registration_code } = req.body;

  if (!plain_registration_code) {
    return res.status(400).json({ error: 'O código de registo é obrigatório.' });
  }

  try {
    // Buscar todos os utilizadores "Guest" não registados
    const users = await prisma.user.findMany({
      where: {
        registrationStatus: false,
        userType: 'USER_TYPE_3'
      },
      select: {
        id: true,
        registrationCode: true
      }
    });

    for (const user of users) {
      const match = await compareRegisterCode(plain_registration_code, user.registrationCode);
      if (match) {
        return res.status(200).json({
          message: 'Código de registo válido.',
          user_id: user.id
        });
      }
    }

    // Se o loop terminar sem encontrar, retorna 404
    return res.status(404).json({ error: 'Código de registo não encontrado ou inválido.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno da API ao verificar o código de registo.' });
  }
};

module.exports = {
  verifyRegisterCode
};
