const express = require('express');
const {
  createSchedule,
  getScheduleByAnamnesis,
  updateScheduleSlot,
  deleteScheduleSlot,
  getAllowedDaysByClient
} = require('../controllers/scheduleController');
const { certifyAccessToken } = require('../utils/authenticateUtils');

const router = express.Router();

// Middleware de autenticação para todas as rotas de schedule
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  try {
    const decoded = await certifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

/**
 * @swagger
 * /api/schedule:
 *   post:
 *     summary: Cria múltiplos slots de horário para uma anamnese
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - anamnesis_id
 *               - slots
 *             properties:
 *               anamnesis_id:
 *                 type: integer
 *                 example: 3
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     week_day:
 *                       type: string
 *                       example: "1"
 *                     start_hour:
 *                       type: string
 *                       example: "08:00:00"
 *                     end_hour:
 *                       type: string
 *                       example: "09:00:00"
 *     responses:
 *       201:
 *         description: Horários criados com sucesso
 *       400:
 *         description: Campos obrigatórios faltando ou formato incorreto
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno
 */
router.post('/schedule', authenticate, createSchedule);

/**
 * @swagger
 * /api/schedule/anamnesis/{anamnesis_id}:
 *   get:
 *     summary: Lista todos os slots de horário de uma anamnese
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: anamnesis_id
 *         schema:
 *           type: integer
 *         required: true
 *         example: 3
 *     responses:
 *       200:
 *         description: Lista de slots retornada com sucesso
 *       400:
 *         description: Parâmetro obrigatório em falta
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno
 */
router.get('/schedule/anamnesis/:anamnesis_id', authenticate, getScheduleByAnamnesis);

/**
 * @swagger
 * /api/schedule/allowed-days/{client_id}:
 *   get:
 *     summary: Retorna os dias da semana em que o cliente tem treino
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client_id
 *         schema:
 *           type: integer
 *         required: true
 *         example: 43
 *     responses:
 *       200:
 *         description: Array de dias permitidos (0=Dom, 1=Seg, ..., 6=Sáb)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allowedDays:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 3, 5]
 *       404:
 *         description: Anamnese não encontrada para este cliente
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno
 */
router.get('/schedule/allowed-days/:client_id', authenticate, getAllowedDaysByClient);

/**
 * @swagger
 * /api/schedule/{id}:
 *   put:
 *     summary: Atualiza um slot de horário existente
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - week_day
 *               - start_hour
 *               - end_hour
 *             properties:
 *               week_day:
 *                 type: string
 *                 example: "3"
 *               start_hour:
 *                 type: string
 *                 example: "10:00:00"
 *               end_hour:
 *                 type: string
 *                 example: "11:00:00"
 *     responses:
 *       200:
 *         description: Slot atualizado com sucesso
 *       400:
 *         description: Campos obrigatórios faltando ou inválidos
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Slot não encontrado
 *       500:
 *         description: Erro interno
 */
router.put('/schedule/:id', authenticate, updateScheduleSlot);

/**
 * @swagger
 * /api/schedule/{id}:
 *   delete:
 *     summary: Apaga um slot de horário pelo ID
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         example: 12
 *     responses:
 *       200:
 *         description: Slot apagado com sucesso
 *       400:
 *         description: ID obrigatório
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Slot não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete('/schedule/:id', authenticate, deleteScheduleSlot);

module.exports = router;