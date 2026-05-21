const express = require('express');
const router = express.Router();
const { createPhysicalAssessment, getAssessmentsByClient, getAssessmentById, updatePhysicalAssessment } = require('../controllers/physicalAssessmentController');
const { certifyAccessToken } = require('../utils/authenticateUtils');

// O teu middleware de segurança
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

router.post('/physical-assessments', authenticate, createPhysicalAssessment);
router.get('/physical-assessments/client/:client_id', authenticate, getAssessmentsByClient);
router.get('/physical-assessments/:id', authenticate, getAssessmentById);
router.put('/physical-assessments/:id', authenticate, updatePhysicalAssessment);
module.exports = router;