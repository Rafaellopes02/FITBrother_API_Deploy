const express = require('express');
const router = express.Router();
const {
  getCompletedWorkoutsByTrainer,
  getAdjustmentsByTrainer,
  createAdjustment,
  updateAdjustment,
  deleteAdjustment,
  assignAdjustment,
  getTrainAdjustmentById
} = require('../controllers/trainAdjustmentController');
const { certifyAccessToken } = require('../utils/authenticateUtils');

const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
  try {
    req.user = await certifyAccessToken(token);
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido.' });
  }
};

router.get('/trainer/:trainer_id/completed-workouts', authenticate, getCompletedWorkoutsByTrainer);
router.get('/trainer/:trainer_id/adjustments', authenticate, getAdjustmentsByTrainer);
router.post('/train-adjustments', authenticate, createAdjustment);
router.put('/train-adjustments/:id', authenticate, updateAdjustment);
router.delete('/train-adjustments/:id', authenticate, deleteAdjustment);
router.post('/train-adjustments/:id/assign', authenticate, assignAdjustment);
router.get('/train-adjustments/:id', authenticate, getTrainAdjustmentById);

module.exports = router;