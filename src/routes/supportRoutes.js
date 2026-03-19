const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const multer = require('multer');

// Configuração do Multer para processar o ficheiro em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/support/report
router.post('/report', upload.single('screenshot'), supportController.sendReport);

module.exports = router;