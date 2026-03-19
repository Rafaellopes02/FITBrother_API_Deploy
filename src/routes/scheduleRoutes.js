const express = require('express');
const {createSchedule, getScheduleByAnamnesis, updateScheduleSlot, deleteScheduleSlot, getAllowedDaysByClient} = require('../controllers/scheduleController');

const router = express.Router();

/**
 * @swagger
 * /api/schedule:
 * post:
 * summary: Cria múltiplos slots de horário para uma anamnese
 * tags: [Schedule]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CreateScheduleRequest'
 * responses:
 * 201:
 * description: Horários criados com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Horários criados
 * slots:
 * type: array
 * items:
 * $ref: '#/components/schemas/ScheduleSlot'
 * 400:
 * description: Requisição inválida — campos obrigatórios faltando ou formato incorreto
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "anamnesis_id e array de slots são obrigatórios."
 * 500:
 * description: Erro interno ao inserir horários
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Erro interno ao inserir horários."
 */
router.post('/schedule', createSchedule);

/**
 * @swagger
 * /api/schedule/anamnesis/{anamnesis_id}:
 * get:
 * summary: Lista todos os slots de horário de uma anamnese
 * tags: [Schedule]
 * parameters:
 * - in: path
 * name: anamnesis_id
 * schema:
 * type: integer
 * required: true
 * description: ID da anamnese
 * example: 5
 * responses:
 * 200:
 * description: Lista de slots retornada com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * slots:
 * type: array
 * items:
 * $ref: '#/components/schemas/ScheduleSlot'
 * 400:
 * description: Parâmetro anamnesis_id é obrigatório
 * 500:
 * description: Erro interno ao buscar horários
 */
router.get('/schedule/anamnesis/:anamnesis_id', getScheduleByAnamnesis);

/**
 * @swagger
 * /api/schedule/{id}:
 * put:
 * summary: Atualiza um slot de horário existente
 * tags: [Schedule]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do slot a ser atualizado
 * example: 12
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - week_day
 * - start_hour
 * - end_hour
 * properties:
 * week_day:
 * type: string
 * enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 * example: FRIDAY
 * start_hour:
 * type: string
 * format: time
 * example: "10:00:00"
 * end_hour:
 * type: string
 * format: time
 * example: "11:00:00"
 * responses:
 * 200:
 * description: Slot atualizado com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Slot atualizado
 * slot:
 * $ref: '#/components/schemas/ScheduleSlot'
 * 400:
 * description: Campos obrigatórios faltando ou inválidos
 * 404:
 * description: Slot não encontrado
 * 500:
 * description: Erro interno ao atualizar horário
 */
router.put('/schedule/:id', updateScheduleSlot);

/**
 * @swagger
 * /api/schedule/{id}:
 * delete:
 * summary: Apaga um slot de horário pelo ID
 * tags: [Schedule]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do slot a ser apagado
 * example: 12
 * responses:
 * 200:
 * description: Slot apagado com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Slot apagado com sucesso.
 * 400:
 * description: ID do slot é obrigatório
 * 404:
 * description: Slot não encontrado
 * 500:
 * description: Erro interno ao apagar horário
 */
router.delete('/schedule/:id', deleteScheduleSlot);

router.get('/schedule/allowed-days/:client_id', getAllowedDaysByClient);

module.exports = router;
