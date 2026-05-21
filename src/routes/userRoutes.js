const express = require('express');
const router = express.Router();
const { 
  createUser, 
  updateUser, 
  getUsersByParentId, 
  getUserById, 
  deleteUserById,
  reactivateUserById,
  hardDeleteUser,
  getTrainerDashboardStats,
  getTrainerSessions,
  completeUserRegistration
} = require('../controllers/userController');

const prisma = require('../prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- CONFIGURAÇÃO DE UPLOAD DE IMAGEM ---
const uploadPath = path.join(process.cwd(), 'uploads', 'profile_pics');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`Pasta criada: ${uploadPath}`);
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

// --- ROTA DE UPLOAD DE IMAGEM ---
router.post('/users/:id/profile-image', upload.single('file'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

    // ATENÇÃO: Se estiveres a testar no telemóvel, muda localhost para o teu IP
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
});

// --- ROTA DE INFO MÍNIMA (PARA O CHAT HEADER) ---
router.get('/users/tiny/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        profile_image: true 
      }
    });
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao buscar user tiny:", error);
    res.status(500).json({ error: "Erro ao buscar user" });
  }
});

// --- ROTA DE INBOX SEGURA (Lista Clientes + Mensagens) ---
router.get('/users/inbox/:parent_user_id', async (req, res) => {
  try {
    const parentId = parseInt(req.params.parent_user_id);

    // 1. Buscar EXATAMENTE os mesmos clientes que a tua rota antiga busca
    const users = await prisma.user.findMany({
      where: { 
        parentUserId: parentId,
        isDeleted: false 
      }
    });

    // 2. Para cada cliente, ir buscar a última mensagem e contar as "não lidas"
    const usersWithMessages = await Promise.all(users.map(async (user) => {
      
      const lastMsg = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: parentId, receiverId: user.id },
            { senderId: user.id, receiverId: parentId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
      const isUnread = lastMsg && lastMsg.senderId === user.id;

      return {
        ...user,
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        unreadCount: isUnread ? 1 : 0 
      };
    }));

    // 3. Ordenar: Quem mandou mensagem mais recente aparece primeiro
    usersWithMessages.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
    res.json({ users: usersWithMessages });

  } catch (error) {
    console.error("Erro na Inbox:", error);
    res.status(500).json({ error: "Erro ao carregar inbox" });
  }
});

// Rota para Avaliações Físicas
router.post('/physical-assessments', async (req, res) => {
  try {
    const assessment = await prisma.physicalAssessment.create({
      data: req.body
    });
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', createUser);
router.post('/users/complete', completeUserRegistration);
router.get('/users/parent/:parent_user_id', getUsersByParentId);
router.get('/users/id/:id', getUserById);
router.put('/users/edit', updateUser);
router.delete('/users/delete/:id', deleteUserById);
router.put('/users/reactivate/:id', reactivateUserById);
router.delete('/users/hard-delete/:id', hardDeleteUser);
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