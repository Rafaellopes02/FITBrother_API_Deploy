const prisma = require('../prisma');
const crypto = require('crypto');

const workoutStatusReverseMap = {
  'WORKOUT_STATUS_0': '0',
  'WORKOUT_STATUS_1': '1',
  'WORKOUT_STATUS_2': '2',
};

const workoutStatusMap = {
  '0': 'WORKOUT_STATUS_0',
  '1': 'WORKOUT_STATUS_1',
  '2': 'WORKOUT_STATUS_2',
};

const parseDate = (dateString) => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }
  return date;
};

const parseTime = (timeString) => {
  if (!timeString) return null;
  const parts = timeString.split(':');
  if (parts.length < 2) return null;

  const date = new Date();
  date.setHours(parseInt(parts[0], 10));
  date.setMinutes(parseInt(parts[1], 10));
  date.setSeconds(parts[2] ? parseInt(parts[2], 10) : 0);
  date.setMilliseconds(0);
  return date;
};


const createWorkout = async (req, res) => {
  const { trainer_id, name, description } = req.body;
  try {
    const newWorkout = await prisma.workout.create({
      data: {
        trainerId: parseInt(trainer_id),
        name: name,
        description: description,
      }
    });
    res.status(201).json({
      ...newWorkout,
      trainer_id: newWorkout.trainerId,
      exercise_signature: newWorkout.exerciseSignature,
      created_at: newWorkout.createdAt,
      updated_at: newWorkout.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar treino' });
  }
};

const getAllWorkouts = async (_, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      orderBy: { id: 'desc' }
    });
    const formattedWorkouts = workouts.map(w => ({
      ...w,
      trainer_id: w.trainerId,
      exercise_signature: w.exerciseSignature,
      created_at: w.createdAt,
      updated_at: w.updatedAt,
    }));
    res.json(formattedWorkouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar treinos' });
  }
};

const getWorkoutById = async (req, res) => {
  const { id } = req.params;
  try {
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
      include: {
        workoutExercises: {
          orderBy: { sequenceOrder: 'asc' },
          include: {
            exercise: true
          }
        }
      }
    });

    if (!workout) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    res.json({
      ...workout,
      trainer_id: workout.trainerId,
      exercise_signature: workout.exerciseSignature,
      created_at: workout.createdAt,
      updated_at: workout.updatedAt,
      workout_exercises: workout.workoutExercises 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar treino' });
  }
};

const updateWorkout = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const updatedWorkout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: { name: name, description: description }
    });
    res.json({
      ...updatedWorkout,
      trainer_id: updatedWorkout.trainerId,
      exercise_signature: updatedWorkout.exerciseSignature,
      created_at: updatedWorkout.createdAt,
      updated_at: updatedWorkout.updatedAt,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Treino não encontrado' });
    res.status(500).json({ error: 'Erro ao atualizar treino' });
  }
};

const deleteWorkout = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.workout.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Treino apagado com sucesso' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Treino não encontrado' });
    res.status(500).json({ error: 'Erro ao apagar treino' });
  }
};

const addClientToWorkout = async (req, res) => {
  const { id } = req.params;
  const { client_id, date } = req.body;
  if (!client_id) return res.status(400).json({ error: 'client_id é obrigatório' });

  try {
    await prisma.workoutClient.create({
      data: {
        workoutId: parseInt(id),
        clientId: parseInt(client_id),
        date: parseDate(date),
      }
    });
    res.status(201).json({ message: 'Cliente associado ao treino' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(409).json({ error: 'Conflito: cliente já associado nesta data.' });
    res.status(500).json({ error: 'Erro ao adicionar cliente' });
  }
};

const updateWorkoutClient = async (req, res) => {
  const { id, clientId, date } = req.params;
  const { start_time, end_time, status } = req.body;

  try {
    const dataToUpdate = {};
    if (start_time) dataToUpdate.startTime = parseTime(start_time); 
    if (end_time) dataToUpdate.endTime = parseTime(end_time);
    if (status) dataToUpdate.status = workoutStatusMap[status] || status;

    const updateResult = await prisma.workoutClient.updateMany({
      where: {
        workoutId: parseInt(id),
        clientId: parseInt(clientId),
        date: new Date(date) 
      },
      data: dataToUpdate
    });
    res.json({ message: 'Atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
};

const removeClientFromWorkout = async (req, res) => {
  const { id, clientId, date } = req.params; 
  try {
    await prisma.workoutClient.deleteMany({
      where: {
        workoutId: parseInt(id),
        clientId: parseInt(clientId),
        date: new Date(date) 
      }
    });
    res.json({ message: 'Cliente removido do treino' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
};

const addExerciseToWorkout = async (req, res) => {
  const { id } = req.params;
  const { exercises } = req.body;
  try {
    const dataToInsert = exercises.map(ex => ({
      workoutId: parseInt(id),
      exerciseId: parseInt(ex.exercise_id),
      sequenceOrder: parseInt(ex.sequence_order),
      customSets: ex.custom_sets ? parseInt(ex.custom_sets) : null,
      customRepetitions: ex.custom_repetitions ? parseInt(ex.custom_repetitions) : null,
      customRestSeconds: ex.custom_rest_seconds ? parseInt(ex.custom_rest_seconds) : null
    }));

    await prisma.workoutExercise.createMany({ data: dataToInsert });
    res.status(201).json({ message: 'Exercícios adicionados' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar exercícios' });
  }
};

const removeExerciseFromWorkout = async (req, res) => {
  const { id, exerciseId } = req.params;
  try {
    await prisma.workoutExercise.deleteMany({
      where: { workoutId: parseInt(id), exerciseId: parseInt(exerciseId) }
    });
    res.json({ message: 'Exercício removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover exercício' });
  }
};

const getWorkoutPlan = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM workout_plan WHERE workout_id = ${parseInt(id)} ORDER BY sequence_order
    `;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar plano' });
  }
};

const getWorkoutByClientId = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await prisma.workoutClient.findMany({
      where: { clientId: parseInt(id) },
      orderBy: { date: 'desc' }
    });
    const formatted = results.map(r => ({
      ...r,
      workout_id: r.workoutId,
      status: workoutStatusReverseMap[r.status]
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar treinos do cliente' });
  }
};

const getClientSchedule = async (req, res) => {
  try {
    const { clientId } = req.params;
    const schedule = await prisma.workoutClient.findMany({
      where: { clientId: parseInt(clientId) },
      include: { workout: { select: { name: true } } },
      orderBy: { date: 'asc' }
    });
    const formatted = schedule.map(item => ({
      ...item,
      status: workoutStatusReverseMap[item.status] || item.status
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar agenda' });
  }
};

const submitWorkoutFeedback = async (req, res) => {
  try {
    const { 
      workoutId, 
      clientId, 
      date, 
      difficulty, 
      fatigue, 
      executionNotes, 
      adjustmentsRequest 
    } = req.body;

    const feedback = await prisma.workoutFeedback.create({
      data: {
        workoutId: parseInt(workoutId),
        clientId: parseInt(clientId),
        date: new Date(date),
        difficulty: difficulty.toString(), 
        fatigue: parseInt(fatigue),
        executionNotes,
        adjustmentsRequest
      }
    });

    res.status(201).json({
      message: 'Feedback enviado com sucesso!',
      data: feedback
    });
  } catch (error) {
    console.error('Erro ao guardar feedback:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe feedback para este treino nesta data.' });
    }
    res.status(500).json({ error: 'Erro interno ao guardar o feedback.' });
  }
};

module.exports = {
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
};