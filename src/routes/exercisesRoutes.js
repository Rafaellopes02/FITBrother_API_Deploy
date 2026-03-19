const express = require('express');
const router = express.Router();
const exercisesController = require('../controllers/exercisesController');

/**
 * @swagger
 * tags:
 * name: Exercises
 * description: Gestão de exercícios
 */

/**
 * @swagger
 * /api/exercises:
 * get:
 * summary: Lista todos os exercícios
 * tags: [Exercises]
 * responses:
 * 200:
 * description: Lista de exercícios retornada com sucesso.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Exercise'
 */
// Rota: GET http://localhost:3001/api/exercises
router.get('/exercises', exercisesController.getAllExercises);

/**
 * @swagger
 * /api/exercises:
 * post:
 * summary: Cria um novo exercício
 * tags: [Exercises]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Exercise'
 * responses:
 * 201:
 * description: Exercício criado com sucesso.
 */
// Rota: POST http://localhost:3001/api/exercises
router.post('/exercises', exercisesController.createExercise);

/**
 * @swagger
 * /api/exercises/{id}:
 * get:
 * summary: Retorna um exercício pelo ID
 * tags: [Exercises]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Dados do exercício.
 * 404:
 * description: Exercício não encontrado.
 */
// Rota: GET http://localhost:3001/api/exercises/:id
router.get('/exercises/:id', exercisesController.getExerciseById);

/**
 * @swagger
 * /api/exercises/{id}:
 * put:
 * summary: Atualiza um exercício existente
 * tags: [Exercises]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 */
// Rota: PUT http://localhost:3001/api/exercises/:id
router.put('/exercises/:id', exercisesController.updateExercise);

/**
 * @swagger
 * /api/exercises/{id}:
 * delete:
 * summary: Remove um exercício
 * tags: [Exercises]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 */
// Rota: DELETE http://localhost:3001/api/exercises/:id
router.delete('/exercises/:id', exercisesController.deleteExercise);

module.exports = router;