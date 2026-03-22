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
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(process.cwd(), 'uploads', 'profile_pics');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/*router.post('/users/:id/profile-image', upload.single('file'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

    const imagePath = `http://localhost:3001/uploads/profile_pics/${req.file.filename}`;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    if (user.profile_image) {
      try {
        const oldImageName = path.basename(user.profile_image);
        const oldImagePath = path.join(uploadPath, oldImageName);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (error) {
        console.warn('Erro ao tentar apagar imagem antiga:', error.message);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile_image: imagePath }
    });

    res.json({
      message: 'Imagem de perfil atualizada com sucesso!',
      user: updatedUser
    });

  } catch (err) {
    console.error('Erro ao atualizar imagem de perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar imagem de perfil.' });
  }
});*/

const { cloudinary, upload } = require('../config/cloudinary');

router.post('/users/:id/profile-image', upload.single('file'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

    // O Cloudinary devolve o URL directo
    const imageUrl = req.file.path;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });

    // Apagar imagem antiga do Cloudinary
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
```

## 4. Adicionar variáveis no Render

No Render → o teu serviço → **Environment**, adiciona:
```
CLOUDINARY_CLOUD_NAME = de6hkgycg
CLOUDINARY_API_KEY = 221338642143778
CLOUDINARY_API_SECRET = rPn7aQK9wb_nOZ00dfiLqe1ZttE



// ===  ROTAS EXISTENTES ===

// Criar novo utilizador
router.post('/users', createUser);

// Obter utilizadores por parent ID
router.get('/users/parent/:parent_user_id', getUsersByParentId);

// Obter utilizador por ID
router.get('/users/id/:id', getUserById);

// Atualizar utilizador
router.put('/users/edit', updateUser);

// Apagar utilizador
router.delete('/users/delete/:id', deleteUserById);

// Reativar utilizador
router.put('/users/reactivate/:id', reactivateUserById);

router.get('/dashboard/stats/:trainer_id', getTrainerDashboardStats);

/**
 * @swagger
 * /api/trainer/{trainerId}/sessions:
 * get:
 * summary: Get upcoming sessions for a trainer
 * tags: [Users]
 * parameters:
 * - in: path
 * name: trainerId
 * required: true
 * schema:
 * type: integer
 * description: ID of the trainer
 * - in: query
 * name: date
 * schema:
 * type: string
 * description: Date filter (e.g., 'today' or 'YYYY-MM-DD')
 * responses:
 * 200:
 * description: List of upcoming sessions
 * 400:
 * description: Invalid request
 * 500:
 * description: Server error
 */
router.get('/trainer/:trainerId/sessions', getTrainerSessions);

module.exports = router;
