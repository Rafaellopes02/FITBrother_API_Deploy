const prisma = require('../prisma');

const verifyRegisterCode = async (req, res) => {
  const { plain_registration_code } = req.body;

  if (!plain_registration_code) {
    return res.status(400).json({ error: 'O código de registo é obrigatório.' });
  }

  try {
    // Procuramos diretamente o utilizador que tem este código exato e ainda está com o registo pendente
    const user = await prisma.user.findFirst({
      where: {
        registrationCode: plain_registration_code.toUpperCase(),
        registrationStatus: false,
        userType: 'USER_TYPE_3'
      },
      select: {
        id: true
      }
    });

    // Se encontrarmos o registo correspondente
    if (user) {
      return res.status(200).json({
        message: 'Código de registo válido.',
        user_id: user.id
      });
    }

    // Se não encontrar nenhuma linha correspondente, retorna 404
    return res.status(404).json({ error: 'Código de registo não encontrado ou inválido.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno da API ao verificar o código de registo.' });
  }
};

module.exports = {
  verifyRegisterCode
};