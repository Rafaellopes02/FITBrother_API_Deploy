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
router.post('/users', createUser);
router.get('/users/parent/:parent_user_id', getUsersByParentId);
router.get('/users/id/:id', getUserById);
router.put('/users/edit', updateUser);
router.delete('/users/delete/:id', deleteUserById);
router.put('/users/reactivate/:id', reactivateUserById);
router.get('/dashboard/stats/:trainer_id', getTrainerDashboardStats);
router.get('/trainer/:trainerId/sessions', getTrainerSessions);

module.exports = router;