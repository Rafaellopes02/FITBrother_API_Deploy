const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const { Server } = require("socket.io");

const userRoutes = require('./routes/userRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const anamnesisRoutes = require('./routes/anamnesisRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const exercisesRoutes = require('./routes/exercisesRoutes');
const supportRoutes = require('./routes/supportRoutes');
const favoriteRoutes = require('./routes/favoritesRoutes');
const trainAdjustmentRoutes = require('./routes/trainAdjustmentRoutes');
const physicalAssessmentRoutes = require('./routes/physicalAssessmentRoutes');

const prisma = require('./prisma');
const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// 1. CONFIGURAÇÃO CORS
app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// 2. MIDDLEWARES GERAIS
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

BigInt.prototype.toJSON = function() { 
  return this.toString(); 
};

// 3. CONFIGURAÇÃO SWAGGER
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de FITBrother',
      version: '1.0.0',
      description: 'API para o FITBrother',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3001}` }
    ],
    tags: [
      { name: 'Anamnesis', description: 'Rotas relacionadas à anamnese dos usuários' },
      { name: 'Exercises', description: 'Gestão de exercícios' },
      { name: 'Schedule', description: 'Endpoints para gerenciamento de horários' },
      { name: 'Users', description: 'Operações de Utilizadores' },
      { name: 'Workouts', description: 'Gerenciamento de treinos' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 4. ROTAS DA API
app.use('/api', userRoutes);
app.use('/api', verifyRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', anamnesisRoutes);
app.use('/api', workoutRoutes);
app.use('/api', exercisesRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api', trainAdjustmentRoutes);
app.use('/api', physicalAssessmentRoutes);

app.get('/', (req, res) => res.send('API FITBrother a funcionar! 🚀'));

// 5. ROTA DE HISTÓRICO DE CHAT
app.get('/chat/history/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  
  if (!user1 || !user2) return res.status(400).json({ error: "IDs em falta" });

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(user1), receiverId: parseInt(user2) },
          { senderId: parseInt(user2), receiverId: parseInt(user1) }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

// 6. SERVIDOR HTTP E SOCKET.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8100", 
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'], 
  allowEIO3: true
});

const onlineUsers = new Map(); 

io.on('connection', (socket) => {
  socket.on('join_chat', (userId) => {
    socket.join(`user_${userId}`);
    socket.userId = userId; 
    onlineUsers.set(userId, true);
    io.emit('user_status', { userId: userId, online: true });
  });

  socket.on('send_message', async (data) => {
    try {
      if (!data.senderId || !data.receiverId || !data.content) {
        console.error('❌ Dados incompletos. Ignorado.');
        return;
      }
      const senderInt = parseInt(data.senderId);
      const receiverInt = parseInt(data.receiverId);

      const savedMsg = await prisma.message.create({
        data: {
          content: data.content,
          senderId: senderInt,
          receiverId: receiverInt
        }
      });
      io.to(`user_${receiverInt}`).emit('receive_message', savedMsg);
      io.to(`user_${senderInt}`).emit('receive_message', savedMsg);
    } catch (e) {
      console.error("❌ ERRO AO SALVAR NA BD:", e.message);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('user_status', { userId: socket.userId, online: false });
    }
  });
  
  socket.on('check_status', (targetId) => {
    const isOnline = onlineUsers.has(targetId);
    socket.emit('user_status', { userId: targetId, online: isOnline });
  });
});

// 7. ARRANCAR O SERVIDOR
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Ligação à BD (Prisma) estabelecida.');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor a correr na porta ${PORT}`);
      console.log(`📄 Swagger: http://localhost:${PORT}/api-docs`);
    });

  } catch (error) {
    console.error('Erro fatal ao ligar à Base de Dados:', error);
    process.exit(1);
  }
}

startServer();