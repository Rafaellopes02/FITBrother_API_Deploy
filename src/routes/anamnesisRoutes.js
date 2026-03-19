const express = require('express');
const { createAnamnesisPersonal, updateAnamnesisHealth, updateAnamnesisActivity, updateAnamnesisGoals, updateAnamnesisNutrition, updateAnamnesisOther, createCompleteAnamnesis, updateCompleteAnamnesis, getAnamnesisByClientId, getLastAnamnesisByClientId, deleteAnamnesisById } = require('../controllers/anamnesisController');

const router = express.Router();

/**
 * @swagger
 * /api/users/anamnesis/personal:
 * post:
 * summary: Etapa 1 - Informação pessoal da anamnese
 * description: Cria a primeira etapa da anamnese com informações pessoais do cliente.
 * tags: [Anamnesis]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AnamnesisPersonal'
 * examples:
 * PersonalExample:
 * summary: Exemplo de payload para informações pessoais
 * value:
 * client_id: 4
 * trainer_id: 4
 * full_name: "João Silva"
 * age: 30
 * gender: "0"
 * weight_kg: 75.5
 * height_cm: 180
 * occupation: "0"
 * occupation_other: ""
 * responses:
 * 201:
 * description: Etapa pessoal criada com sucesso
 * 400:
 * description: Campos obrigatórios em falta
 */
router.post('/users/anamnesis/personal', createAnamnesisPersonal);

/**
 * @swagger
 * /api/users/anamnesis/{id}/health:
 * patch:
 * summary: Etapa 2 - Histórico de saúde da anamnese
 * description: Atualiza o histórico de saúde do cliente na anamnese.
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da anamnese a ser atualizada
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AnamnesisHealth'
 * examples:
 * HealthExample:
 * summary: Exemplo de payload para histórico de saúde
 * value:
 * medical_conditions: ["0", "1"]
 * medical_condition_other: ""
 * spine_joint_injuries: false
 * injury_description: ""
 * regular_medication: true
 * medication_description: "Metformina 500mg diário"
 * allergies: true
 * allergy_description: "Alergia a amendoim"
 * last_medical_exam: "2024-11-15"
 * responses:
 * 200:
 * description: Histórico de saúde atualizado com sucesso
 * 400:
 * description: Campos obrigatórios em falta
 */
router.patch('/users/anamnesis/:id/health', updateAnamnesisHealth);

/**
 * @swagger
 * /api/users/anamnesis/{id}/activity:
 * patch:
 * summary: Etapa 3 - Atividade física da anamnese
 * description: Atualiza as informações sobre atividade física do cliente.
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da anamnese a ser atualizada
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AnamnesisActivity'
 * examples:
 * ActivityExample:
 * summary: Exemplo de payload para atividade física
 * value:
 * activity_level: "1"
 * training_experience: "2"
 * exercise_types: ["0", "1"]
 * exercise_other: ""
 * responses:
 * 200:
 * description: Atividade física atualizada com sucesso
 * 400:
 * description: Campos obrigatórios em falta
 */
router.patch('/users/anamnesis/:id/activity', updateAnamnesisActivity);

/**
 * @swagger
 * /api/users/anamnesis/{id}/goals:
 * patch:
 * summary: Etapa 4 - Objetivos da anamnese
 * description: Atualiza os objetivos de treino e saúde do cliente.
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da anamnese a ser atualizada
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AnamnesisGoals'
 * examples:
 * GoalsExample:
 * summary: Exemplo de payload para objetivos
 * value:
 * goals: ["0", "1"]
 * goal_other: ""
 * specific_goal: "Perder 5kg em 3 meses"
 * training_availability: "1"
 * responses:
 * 200:
 * description: Objetivos atualizados com sucesso
 * 400:
 * description: Campos obrigatórios em falta
 */
router.patch('/users/anamnesis/:id/goals', updateAnamnesisGoals);

/**
 * @swagger
 * /api/users/anamnesis/{id}/nutrition:
 * patch:
 * summary: Etapa 5 - Nutrição e estilo de vida da anamnese
 * description: Atualiza informações sobre nutrição e estilo de vida do cliente.
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da anamnese a ser atualizada
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AnamnesisNutrition'
 * examples:
 * NutritionExample:
 * summary: Exemplo de payload para nutrição
 * value:
 * nutrition_type: "0"
 * nutrition_other: ""
 * eats_processed_food: "2"
 * sleep_hours: 7
 * stress_level: "1"
 * stress_comments: "Trabalho estressante, mas gerenciável"
 * responses:
 * 200:
 * description: Nutrição atualizada com sucesso
 * 400:
 * description: Campos obrigatórios em falta
 */
router.patch('/users/anamnesis/:id/nutrition', updateAnamnesisNutrition);

/**
 * @swagger
 * /api/users/anamnesis/{id}/other:
 * patch:
 * summary: Etapa 6 - Outras informações da anamnese
 * description: Atualiza informações complementares da anamnese do cliente.
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da anamnese a ser atualizada
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AnamnesisOther'
 * examples:
 * OtherExample:
 * summary: Exemplo de payload para outras informações
 * value:
 * had_personal_trainer: true
 * personal_trainer_experience: "3 meses com personal focado em hipertrofia"
 * wants_progress_tracking: true
 * responses:
 * 200:
 * description: Outras informações atualizadas com sucesso
 * 400:
 * description: Campos obrigatórios em falta
 */
router.patch('/users/anamnesis/:id/other', updateAnamnesisOther);

/**
 * @swagger
 * /api/users/anamnesis/complete:
 * post:
 * summary: Cria uma Anamnese Completa
 * description: Registra todas as etapas da anamnese de uma só vez.
 * tags: [Anamnesis]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - personal
 * - health
 * - activity
 * - goals
 * - nutrition
 * - other
 * properties:
 * personal:
 * $ref: '#/components/schemas/AnamnesisPersonal'
 * health:
 * $ref: '#/components/schemas/AnamnesisHealth'
 * activity:
 * $ref: '#/components/schemas/AnamnesisActivity'
 * goals:
 * $ref: '#/components/schemas/AnamnesisGoals'
 * nutrition:
 * $ref: '#/components/schemas/AnamnesisNutrition'
 * other:
 * $ref: '#/components/schemas/AnamnesisOther'
 * examples:
 * CompleteAnamnesisExample:
 * summary: Exemplo de payload completo
 * value:
 * personal:
 * client_id: 4
 * trainer_id: 4
 * full_name: "João Silva"
 * age: 30
 * gender: "0"
 * weight_kg: 75.5
 * height_cm: 180
 * occupation: "0"
 * occupation_other: "Ou outra ocupação"
 * health:
 * medical_conditions: ["0"]
 * medical_condition_other: "string"
 * spine_joint_injuries: true
 * injury_description: "string"
 * regular_medication: true
 * medication_description: "string"
 * allergies: true
 * allergy_description: "string"
 * last_medical_exam: "2025-05-07"
 * activity:
 * activity_level: "0"
 * training_experience: "0"
 * exercise_types: ["0"]
 * exercise_other: "string"
 * goals:
 * goals: ["0"]
 * goal_other: "string"
 * specific_goal: "string"
 * training_availability: "0"
 * nutrition:
 * nutrition_type: "0"
 * nutrition_other: "string"
 * eats_processed_food: "0"
 * sleep_hours: 10
 * stress_level: "0"
 * stress_comments: "string"
 * other:
 * had_personal_trainer: true
 * personal_trainer_experience: "string"
 * wants_progress_tracking: true
 * responses:
 * 201:
 * description: Anamnese completa criada com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: "Anamnese completa criada com sucesso."
 * anamnesis_id:
 * type: integer
 * example: 123
 * created_at:
 * type: string
 * format: date-time
 * 400:
 * description: Campos obrigatórios em falta ou dados inválidos
 * 500:
 * description: Erro ao criar anamnese completa
 */
router.post('/users/anamnesis/complete', createCompleteAnamnesis);


/**
 * @swagger
 * /api/users/anamnesis/{id}/complete:
 * patch:
 * summary: Atualiza uma Anamnese Completa
 * description: Atualiza todas as etapas da anamnese de uma só vez para um cliente existente.
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da anamnese a ser atualizada
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * personal:
 * $ref: '#/components/schemas/AnamnesisPersonal'
 * health:
 * $ref: '#/components/schemas/AnamnesisHealth'
 * activity:
 * $ref: '#/components/schemas/AnamnesisActivity'
 * goals:
 * $ref: '#/components/schemas/AnamnesisGoals'
 * nutrition:
 * $ref: '#/components/schemas/AnamnesisNutrition'
 * other:
 * $ref: '#/components/schemas/AnamnesisOther'
 * examples:
 * CompleteUpdateExample:
 * summary: Exemplo de atualização completa de anamnese
 * value:
 * personal:
 * full_name: "João Silva"
 * age: 31
 * weight_kg: 76
 * height_cm: 180
 * occupation: "1"
 * health:
 * medical_conditions: ["4"]
 * spine_joint_injuries: false
 * regular_medication: false
 * allergies: false
 * activity:
 * activity_level: "2"
 * training_experience: "2"
 * exercise_types: ["1", "2"]
 * goals:
 * goals: ["1"]
 * specific_goal: "Ganho de massa muscular"
 * training_availability: "2"
 * nutrition:
 * nutrition_type: "1"
 * eats_processed_food: "1"
 * sleep_hours: 8
 * stress_level: "2"
 * other:
 * had_personal_trainer: false
 * wants_progress_tracking: true
 * responses:
 * 200:
 * description: Anamnese completa atualizada com sucesso
 * 400:
 * description: Campos obrigatórios em falta ou dados inválidos
 * 404:
 * description: Anamnese não encontrada
 * 500:
 * description: Erro ao atualizar anamnese completa
 */
router.patch('/users/anamnesis/:id/complete', updateCompleteAnamnesis);

/**
 * @swagger
 * /api/users/anamnesis/client/{client_id}:
 * get:
 * summary: Lista todas as anamneses de um cliente
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: client_id
 * required: true
 * schema:
 * type: integer
 * description: ID do cliente
 * example: 4
 * responses:
 * 200:
 * description: Lista de anamneses retornada com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * anamneses:
 * type: array
 * items:
 * $ref: '#/components/schemas/AnamnesisPersonal'
 * 400:
 * description: Parâmetro client_id é obrigatório
 * 500:
 * description: Erro interno ao buscar anamneses
 */
router.get('/users/anamnesis/client/:client_id', getAnamnesisByClientId);


/**
 * @swagger
 * /api/users/anamnesis/client/{client_id}/last:
 * get:
 * summary: Retorna a última anamnese de um cliente
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: client_id
 * required: true
 * schema:
 * type: integer
 * description: ID do cliente
 * example: 4
 * responses:
 * 200:
 * description: Última anamnese retornada com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * anamnesis:
 * $ref: '#/components/schemas/AnamnesisPersonal'
 * 404:
 * description: Nenhuma anamnese encontrada para este cliente
 */
router.get('/users/anamnesis/client/:client_id/last', getLastAnamnesisByClientId);


/**
 * @swagger
 * /api/anamnesis/{id}:
 * delete:
 * summary: Remove uma anamnese pelo ID
 * tags: [Anamnesis]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da anamnese a ser apagada
 * example: 10
 * responses:
 * 200:
 * description: Anamnese apagada com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: "Anamnese apagada com sucesso."
 * 400:
 * description: Parâmetro id é obrigatório
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Parâmetro id é obrigatório."
 * 404:
 * description: Anamnese não encontrada
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Anamnese não encontrada."
 * 500:
 * description: Erro interno ao apagar anamnese
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Erro interno ao apagar anamnese."
 */
router.delete('/anamnesis/:id', deleteAnamnesisById);

module.exports = router;