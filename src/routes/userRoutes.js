const express = require('express');
const router = express.Router();
const { 
  createUser, 
  updateUser, 
  getUsersByParentId, 
  getUserById, 
  deleteUserById,
  reactivateUserById,
  getTrainerDashboardStats,
  getTrainerSessions
} = require('../controllers/userController');

const prisma = require('../prisma');
const { cloudinary, upload } = require('../config/cloudinary');

// === UPLOAD IMAGEM DE PERFIL ===
router.post('/users/:id/profile-image', upload.single('file'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

    const imageUrl = req.file.path;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });

    if (user.profile_image) {
      try {
        const publicId = user.profile_image.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.warn('Erro ao apagar imagem antiga:', error.message);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile_image: imageUrl }
    });

    res.json({ message: 'Imagem de perfil atualizada com sucesso!', user: updatedUser });

  } catch (err) {
    console.error('Erro ao atualizar imagem de perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar imagem de perfil.' });
  }
});

// === ROTAS EXISTENTES ===

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Criar novo utilizador
 *     tags: [Users]
 */
router.post('/users', createUser);

/**
 * @swagger
 * /api/users/parent/{parent_user_id}:
 *   get:
 *     summary: Obter utilizadores por parent ID
 *     tags: [Users]
 */
router.get('/users/parent/:parent_user_id', getUsersByParentId);

/**
 * @swagger
 * /api/users/id/{id}:
 *   get:
 *     summary: Obter utilizador por ID
 *     tags: [Users]
 */
router.get('/users/id/:id', getUserById);

/**
 * @swagger
 * /api/users/edit:
 *   put:
 *     summary: Atualizar utilizador
 *     tags: [Users]
 */
router.put('/users/edit', updateUser);

/**
 * @swagger
 * /api/users/delete/{id}:
 *   delete:
 *     summary: Apagar utilizador
 *     tags: [Users]
 */
router.delete('/users/delete/:id', deleteUserById);

/**
 * @swagger
 * /api/users/reactivate/{id}:
 *   put:
 *     summary: Reativar utilizador
 *     tags: [Users]
 */
router.put('/users/reactivate/:id', reactivateUserById);

/**
 * @swagger
 * /api/dashboard/stats/{trainer_id}:
 *   get:
 *     summary: Estatísticas do dashboard do treinador
 *     tags: [Users]
 */
router.get('/dashboard/stats/:trainer_id', getTrainerDashboardStats);

/**
 * @swagger
 * /api/trainer/{trainerId}/sessions:
 *   get:
 *     summary: Get upcoming sessions for a trainer
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 */
router.get('/trainer/:trainerId/sessions', getTrainerSessions);

module.exports = router;