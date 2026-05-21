const prisma = require('../prisma');

const toggleFavorite = async (req, res) => {
  const { trainerId, clientId } = req.body;
  try {
    const existing = await prisma.favoriteClient.findFirst({
      where: { trainerId: parseInt(trainerId), clientId: parseInt(clientId) }
    });

    if (existing) {
      await prisma.favoriteClient.delete({ where: { id: existing.id } });
      return res.json({ isFavorite: false, message: 'Removido dos favoritos' });
    }

    await prisma.favoriteClient.create({
      data: { trainerId: parseInt(trainerId), clientId: parseInt(clientId) }
    });
    res.json({ isFavorite: true, message: 'Adicionado aos favoritos' });
  } catch (error) {
    console.error('Erro no toggleFavorite:', error);
    res.status(500).json({ error: 'Erro interno ao processar favorito' });
  }
};

const getFavorites = async (req, res) => {
  const { trainerId } = req.params;
  try {
    const favorites = await prisma.favoriteClient.findMany({
      where: { trainerId: parseInt(trainerId) },
      include: { client: true }
    });
    res.json(favorites.map(f => f.client));
  } catch (error) {
    console.error('Erro no getFavorites:', error);
    res.status(500).json({ error: 'Erro interno ao buscar favoritos' });
  }
};

module.exports = { toggleFavorite, getFavorites };