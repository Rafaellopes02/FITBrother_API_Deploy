const express = require('express');
const router = express.Router();
const {
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  addClientToWorkout,
  updateWorkoutClient,
  removeClientFromWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  getWorkoutPlan,
  getWorkoutByClientId,
  getClientSchedule,
  submitWorkoutFeedback
} = require('../controllers/workoutController');

/**
 * @swagger
 * tags:
 * name: Workouts
 * description: Gerenciamento de treinos
 */

/**
 * @swagger
 * components:
 * schemas:
 * Workout:
 * type: object
 * properties:
 * id:
 * type: integer
 * trainer_id:
 * type: integer
 * name:
 * type: string
 * description:
 * type: string
 * created_at:
 * type: string
 * format: date-time
 * updated_at:
 * type: string
 * format: date-time
 */

/**
 * @swagger
 * /api/workouts:
 * post:
 * summary: Cria um novo treino
 * tags: [Workouts]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - trainer_id
 * - name
 * properties:
 * trainer_id:
 * type: integer
 * name:
 * type: string
 * description:
 * type: string
 * responses:
 * 201:
 * description: Treino criado com sucesso!
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Workout'
 * 500:
 * description: Erro interno da API.
 */
router.post('/workouts', createWorkout);

/**
 * @swagger
 * /api/workouts:
 * get:
 * summary: Lista todos os treinos
 * tags: [Workouts]
 * responses:
 * 200:
 * description: Lista de treinos.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Workout'
 * 404:
 * description: Treinos não encontrados.
 * 500:
 * description: Erro interno da API.
 */
router.get('/workouts', getAllWorkouts);

/**
 * @swagger
 * /api/workouts/{id}:
 * get:
 * summary: Retorna um treino pelo ID
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID do treino
 * responses:
 * 200:
 * description: Detalhes do treino.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Workout'
 * 404:
 * description: Treino não encontrado.
 * 500:
 * description: Erro interno da API.
 */
router.get('/workouts/:id', getWorkoutById);

/**
 * @swagger
 * /api/workouts/{id}:
 * put:
 * summary: Atualiza um treino existente
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * description:
 * type: string
 * responses:
 * 200:
 * description: Treino atualizado com sucesso!
 * 404:
 * description: Treino não encontrado,
 * 500:
 * description: Erro interno da API.
 */
router.put('/workouts/:id', updateWorkout);

/**
 * @swagger
 * /api/workouts/{id}:
 * delete:
 * summary: Remove um treino
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Treino removido com sucesso!
 * 404:
 * description: Treino não encontrado.
 * 500:
 * description: Erro interno da API.
 */
router.delete('/workouts/:id', deleteWorkout);

/**
 * @swagger
 * /api/workouts/{id}/clients:
 * post:
 * summary: Adiciona um cliente a um treino existente
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID do treino
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - client_id
 * properties:
 * client_id:
 * type: integer
 * example: 42
 * date:
 * type: string
 * format: date-time
 * description: Data personalizada no formato ISO 8601
 * example: "2025-06-23"
 * responses:
 * 201:
 * description: Cliente associado ao treino.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 400:
 * description: Dados inválidos ou ausentes.
 * 500:
 * description: Erro interno da API.
 */
router.post('/workouts/:id/clients', addClientToWorkout);

/**
 * @swagger
 * /api/workouts/{id}/clients/{clientId}/date/{date}:
 * patch:
 * summary: Atualiza parcialmente os dados da associação entre cliente e treino (start_time, end_time e status)
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID do treino
 * - in: path
 * name: clientId
 * required: true
 * schema:
 * type: integer
 * description: ID do cliente
 * - in: path
 * name: date
 * required: true
 * schema:
 * type: string
 * format: date
 * description: Data da associação no formato YYYY-MM-DD
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * start_time:
 * type: string
 * format: time
 * example: "18:00:00"
 * end_time:
 * type: string
 * format: time
 * example: "19:00:00"
 * status:
 * type: string
 * enum: [0, 1, 2]
 * responses:
 * 200:
 * description: Associação atualizada com sucesso.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * workout_id:
 * type: integer
 * client_id:
 * type: integer
 * date:
 * type: string
 * format: date
 * start_time:
 * type: string
 * end_time:
 * type: string
 * status:
 * type: string
 * 400:
 * description: Nenhum campo fornecido para atualização.
 * 404:
 * description: Associação treino-cliente não encontrada.
 * 500:
 * description: Erro interno da API.
 */
router.patch('/workouts/:id/clients/:clientId/date/:date', updateWorkoutClient);

/**
 * @swagger
 * /api/workouts/{id}/clients/{clientId}/date/{date}:
 * delete:
 * summary: Remove um cliente do treino
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * - in: path
 * name: clientId
 * required: true
 * schema:
 * type: integer
 * - in: path
 * name: date
 * required: true
 * schema:
 * type: string
 * format: date
 * description: Data da associação no formato YYYY-MM-DD
 * responses:
 * 200:
 * description: Cliente removido do treino
 * 500:
 * description: Erro interno da API.
 */
router.delete('/workouts/:id/clients/:clientId/date/:date', removeClientFromWorkout);

/**
 * @swagger
 * /api/workouts/{id}/exercises:
 * post:
 * summary: Adiciona vários exercícios ao treino
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - exercises
 * properties:
 * exercises:
 * type: array
 * items:
 * type: object
 * required:
 * - exercise_id
 * - sequence_order
 * properties:
 * exercise_id:
 * type: integer
 * sequence_order:
 * type: integer
 * custom_sets:
 * type: integer
 * custom_repetitions:
 * type: integer
 * custom_rest_seconds:
 * type: integer
 * responses:
 * 201:
 * description: Exercícios adicionados ao treino
 * 400:
 * description: Erro de validação no payload
 * 409:
 * description: Exercícios com sequence_order duplicado ou treino duplicado
 * 500:
 * description: Erro interno no servidor
 */
router.post('/workouts/:id/exercises', addExerciseToWorkout);

/**
 * @swagger
 * /api/workouts/{id}/exercises/{exerciseId}:
 * delete:
 * summary: Remove um exercício do treino
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * - in: path
 * name: exerciseId
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Exercício removido do treino
 */
router.delete('/workouts/:id/exercises/:exerciseId', removeExerciseFromWorkout);

/**
 * @swagger
 * /api/workouts/{id}/plan:
 * get:
 * summary: Obtém o plano completo do treino
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Plano de treino detalhado
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * workout_id:
 * type: integer
 * sequence_order:
 * type: integer
 * exercise_id:
 * type: integer
 * name:
 * type: string
 * sets:
 * type: integer
 * repetitions:
 * type: integer
 * rest_seconds:
 * type: integer
 */
router.get('/workouts/:id/plan', getWorkoutPlan);


/**
 * @swagger
 * /api/workout_clients/{id}:
 * get:
 * summary: Retorna os treinos pelo ID do cliente
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID do cliente
 * responses:
 * 200:
 * description: Lista de treinos do cliente.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Workout'
 * 404:
 * description: Treino não encontrado.
 * 500:
 * description: Erro interno da API.
 */
router.get('/workout_clients/:id', getWorkoutByClientId);

/**
 * @swagger
 * /api/clients/{clientId}/workouts:
 * get:
 * summary: Retorna a agenda de treinos de um cliente específico
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: clientId
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Lista de datas e treinos marcados
 */
router.get('/clients/:clientId/workouts', getClientSchedule);

/**
 * @swagger
 * /api/workout_clients/{clientId}/schedule:
 * get:
 * summary: Retorna a agenda de treinos de um cliente específico
 * tags: [Workouts]
 * parameters:
 * - in: path
 * name: clientId
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Lista de datas e treinos marcados
 */
router.get('/workout_clients/:clientId/schedule', getClientSchedule);

/**
 * @swagger
 * /api/workouts/feedback:
 * post:
 * summary: Envia o feedback de um treino concluído
 * tags: [Workouts]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * workoutId: { type: integer }
 * clientId: { type: integer }s
 * date: { type: string, format: date }
 * difficulty: { type: string }
 * fatigue: { type: integer }
 * executionNotes: { type: string }
 * adjustmentsRequest: { type: string }
 * responses:
 * 201:
 * description: Feedback guardado com sucesso.
 */
router.post('/workouts/feedback', submitWorkoutFeedback);

module.exports = router;