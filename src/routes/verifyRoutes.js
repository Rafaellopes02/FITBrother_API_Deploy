const express = require('express');
const { verifyRegisterCode } = require('../controllers/verifyController');
const { verifyLogin } = require('../controllers/verifyLoginController');

const router = express.Router();

/**
 * @swagger
 * /api/verify:
 * post:
 * summary: Verifica se o código de registo existe
 * tags: [Users]
 * requestBody:
 * description: Código de registo enviado pelo utilizador
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * plain_registration_code:
 * type: string
 * example: "ABC123"
 * responses:
 * 200:
 * description: Código de registo válido
 * 400:
 * description: Código de registo não fornecido pelo utilizador
 * 404:
 * description: Código de registo não encontrado
 * 500:
 * description: Erro interno do servidor
 */
router.post('/verify', verifyRegisterCode);

/**
 * @swagger
 * /api/verifyLogin:
 * post:
 * summary: Verifica o login do utilizador com email e password
 * tags: [Users]
 * requestBody:
 * description: Credenciais do utilizador
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * example: "joao@gmail.pt"
 * password:
 * type: string
 * example: "joao123"
 * responses:
 * 200:
 * description: Login bem-sucedido
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * id:
 * type: integer
 * example: 1
 * name:
 * type: string
 * example: "João"
 * user_type:
 * type: integer
 * example: 0
 * token:
 * type: string
 * example: "ABC123"
 * 400:
 * description: Email e password obrigatórios
 * 403:
 * description: Password incorreta ou utilizador sem password definida
 * 404:
 * description: Utilizador não encontrado
 * 500:
 * description: Erro interno do servidor
 */
router.post('/verifyLogin', verifyLogin);

module.exports = router;
