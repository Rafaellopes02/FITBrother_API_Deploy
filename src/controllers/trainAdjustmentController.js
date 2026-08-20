const prisma = require('../prisma');

const getCompletedWorkoutsByTrainer = async (req, res) => {
  const { trainer_id } = req.params;
  try {
    const clients = await prisma.user.findMany({
      where: { parentUserId: parseInt(trainer_id), userType: 'USER_TYPE_3', isDeleted: false },
      select: { id: true, name: true, profile_image: true }
    });

    const clientIds = clients.map(c => c.id);
    if (clientIds.length === 0) return res.status(200).json([]);

    const completed = await prisma.workoutClient.findMany({
      where: {
        clientId: { in: clientIds },
        status: 'WORKOUT_STATUS_1'
      },
      include: {
        workout: { select: { id: true, name: true, description: true } },
        feedback: true
      },
      orderBy: { date: 'desc' }
    });

    const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

    const result = completed.map(wc => ({
      workoutId: wc.workoutId,
      clientId: wc.clientId,
      clientName: clientMap[wc.clientId]?.name || 'Cliente',
      clientImage: clientMap[wc.clientId]?.profile_image || null,
      date: wc.date,
      workoutName: wc.workout?.name || '',
      workoutDescription: wc.workout?.description || '',
      hasFeedback: !!wc.feedback,
      feedback: wc.feedback ? {
        difficulty: wc.feedback.difficulty,
        fatigue: wc.feedback.fatigue,
        executionNotes: wc.feedback.executionNotes,
        adjustmentsRequest: wc.feedback.adjustmentsRequest,
        createdAt: wc.feedback.createdAt
      } : null
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro ao buscar treinos concluídos:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
};

// Ajustes de treino por treinador
const getAdjustmentsByTrainer = async (req, res) => {
  const { trainer_id } = req.params;
  try {
    const adjustments = await prisma.trainAdjustment.findMany({
      where: { trainerId: parseInt(trainer_id) },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { sequenceOrder: 'asc' }
        },
        client: { select: { name: true } },
        originalWorkout: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(adjustments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
};

// POST: Criar ajuste 
const createAdjustment = async (req, res) => {
  const { trainer_id, original_workout_id, client_id, name, description, exercises } = req.body;

  if (!trainer_id || !original_workout_id || !client_id || !name) {
    return res.status(400).json({ error: 'trainer_id, original_workout_id, client_id e name são obrigatórios.' });
  }

  try {
    const adjustment = await prisma.trainAdjustment.create({
      data: {
        trainerId: parseInt(trainer_id),
        originalWorkoutId: parseInt(original_workout_id),
        clientId: parseInt(client_id),
        name,
        description: description || null,
        exercises: exercises?.length ? {
          create: exercises.map((ex, idx) => ({
            exerciseId: parseInt(ex.exercise_id),
            sequenceOrder: ex.sequence_order ?? idx + 1,
            customSets: ex.custom_sets ? parseInt(ex.custom_sets) : null,
            customRepetitions: ex.custom_repetitions ? parseInt(ex.custom_repetitions) : null,
            customRestSeconds: ex.custom_rest_seconds ? parseInt(ex.custom_rest_seconds) : null,
          }))
        } : undefined
      },
      include: {
        exercises: { include: { exercise: true }, orderBy: { sequenceOrder: 'asc' } }
      }
    });

    return res.status(201).json({ message: 'Ajuste criado com sucesso.', adjustment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar ajuste.' });
  }
};

// PUT: Atualizar ajuste 
const updateAdjustment = async (req, res) => {
  const { id } = req.params;
  const { name, description, exercises } = req.body;

  try {
    await prisma.trainAdjustment.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        updatedAt: new Date()
      }
    });

    if (exercises) {
      await prisma.trainAdjustmentExercise.deleteMany({ where: { adjustmentId: parseInt(id) } });
      if (exercises.length > 0) {
        await prisma.trainAdjustmentExercise.createMany({
          data: exercises.map((ex, idx) => ({
            adjustmentId: parseInt(id),
            exerciseId: parseInt(ex.exercise_id),
            sequenceOrder: ex.sequence_order ?? idx + 1,
            customSets: ex.custom_sets ? parseInt(ex.custom_sets) : null,
            customRepetitions: ex.custom_repetitions ? parseInt(ex.custom_repetitions) : null,
            customRestSeconds: ex.custom_rest_seconds ? parseInt(ex.custom_rest_seconds) : null,
          }))
        });
      }
    }

    const updated = await prisma.trainAdjustment.findUnique({
      where: { id: parseInt(id) },
      include: { exercises: { include: { exercise: true }, orderBy: { sequenceOrder: 'asc' } } }
    });

    return res.status(200).json({ message: 'Ajuste atualizado.', adjustment: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar ajuste.' });
  }
};

// DELETE: Apagar ajuste 
const deleteAdjustment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.trainAdjustment.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ message: 'Ajuste apagado.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao apagar ajuste.' });
  }
};

// POST: Atribuir Ajuste
const assignAdjustment = async (req, res) => {
  const { id } = req.params; // ID do TrainAdjustment
  const { client_id, date } = req.body;

  if (!client_id || !date) {
    return res.status(400).json({ error: 'client_id e date são obrigatórios.' });
  }

  try {
    // 1. Vai buscar o Ajuste e os seus exercícios
    const adjustment = await prisma.trainAdjustment.findUnique({
      where: { id: parseInt(id) },
      include: { exercises: true }
    });

    if (!adjustment) {
      return res.status(404).json({ error: 'Ajuste de treino não encontrado.' });
    }

    // 2. Transforma o Ajuste num "Treino Real" (Workout) exclusivo para este agendamento
    const newWorkout = await prisma.workout.create({
      data: {
        trainerId: adjustment.trainerId,
        name: adjustment.name,
        description: adjustment.description || 'Treino Ajustado pelo Personal Trainer.',
        workoutExercises: {
          create: adjustment.exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sequenceOrder: ex.sequenceOrder,
            customSets: ex.customSets,
            customRepetitions: ex.customRepetitions,
            customRestSeconds: ex.customRestSeconds
          }))
        }
      }
    });

    // 3. Associa este novo treino real ao calendário do cliente
    await prisma.workoutClient.create({
      data: {
        workoutId: newWorkout.id,
        clientId: parseInt(client_id),
        date: new Date(date)
      }
    });

    return res.status(201).json({ 
      message: 'Ajuste atribuído com sucesso!', 
      workoutId: newWorkout.id 
    });

  } catch (err) {
    console.error('Erro ao atribuir ajuste:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'O cliente já tem um treino atribuído nesta data.' });
    }
    return res.status(500).json({ error: 'Erro interno ao atribuir o ajuste.' });
  }
};

const getTrainAdjustmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const adjustment = await prisma.trainAdjustment.findUnique({
      where: { id: parseInt(id) },
      include: {
        // MUITO IMPORTANTE: Trazemos os exercícios ligados a este treino!
        // Confirma se o nome da relação no teu Prisma é "TrainAdjustmentExercise" ou "exercises"
        exercises: { 
          include: {
            exercise: true // Traz os detalhes do exercício (nome, etc)
          }
        }
      }
    });

    if (!adjustment) {
      return res.status(404).json({ error: 'Treino adaptado não encontrado' });
    }

    return res.status(200).json({ workout: adjustment });
  } catch (error) {
    console.error('Erro ao buscar treino adaptado:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar treino adaptado' });
  }
};

module.exports = {
  getCompletedWorkoutsByTrainer,
  getAdjustmentsByTrainer,
  createAdjustment,
  updateAdjustment,
  deleteAdjustment,
  assignAdjustment,
  getTrainAdjustmentById
};