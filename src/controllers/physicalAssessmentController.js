const prisma = require('../prisma');

const createPhysicalAssessment = async (req, res) => {
  const {
    clientId, trainerId, weight, height, bmi,
    armCircum, waistCircum, hipCircum, thighCircum,
    bodyFatPercent, muscleMass, postureNotes, postureImages,
    flexibility, balance, cardioNotes, pushups, situps,
    squats, plankTimeSec, feedback
  } = req.body;

  // Validação básica
  if (!clientId || !trainerId || !weight || !height) {
    return res.status(400).json({ error: 'Os campos clientId, trainerId, weight e height são obrigatórios.' });
  }

  try {
    const newAssessment = await prisma.physicalAssessment.create({
      data: {
        clientId: parseInt(clientId),
        trainerId: parseInt(trainerId),
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: parseFloat(bmi),
        armCircum: armCircum ? parseFloat(armCircum) : null,
        waistCircum: waistCircum ? parseFloat(waistCircum) : null,
        hipCircum: hipCircum ? parseFloat(hipCircum) : null,
        thighCircum: thighCircum ? parseFloat(thighCircum) : null,
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        postureNotes: postureNotes || null,
        postureImages: postureImages || null,
        flexibility: flexibility || null,
        balance: balance || null,
        cardioNotes: cardioNotes || null,
        pushups: pushups ? parseInt(pushups) : null,
        situps: situps ? parseInt(situps) : null,
        squats: squats ? parseInt(squats) : null,
        plankTimeSec: plankTimeSec ? parseInt(plankTimeSec) : null,
        feedback: feedback || null,
      }
    });

    return res.status(201).json({
      message: 'Avaliação física criada com sucesso!',
      assessment: newAssessment
    });

  } catch (err) {
    console.error('Erro ao criar avaliação física:', err);
    return res.status(500).json({ error: 'Erro interno ao gravar a avaliação física.' });
  }
};

const getAssessmentsByClient = async (req, res) => {
  const { client_id } = req.params;

  if (!client_id) {
    return res.status(400).json({ error: 'ID do cliente é obrigatório.' });
  }

  try {
    const assessments = await prisma.physicalAssessment.findMany({
      where: { clientId: parseInt(client_id) },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ assessments });
  } catch (err) {
    console.error('Erro ao buscar avaliações:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar histórico de avaliações.' });
  }
};

const getAssessmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await prisma.physicalAssessment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    return res.status(200).json({ assessment });
  } catch (err) {
    console.error('Erro ao buscar avaliação:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar avaliação.' });
  }
};

const updatePhysicalAssessment = async (req, res) => {
  const { id } = req.params;
  const {
    weight, height, bmi, armCircum, waistCircum, hipCircum, thighCircum,
    bodyFatPercent, muscleMass, postureNotes, postureImages,
    flexibility, balance, cardioNotes, pushups, situps, squats, plankTimeSec, feedback
  } = req.body;

  try {
    const updatedAssessment = await prisma.physicalAssessment.update({
      where: { id: parseInt(id) },
      data: {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        armCircum: armCircum ? parseFloat(armCircum) : null,
        waistCircum: waistCircum ? parseFloat(waistCircum) : null,
        hipCircum: hipCircum ? parseFloat(hipCircum) : null,
        thighCircum: thighCircum ? parseFloat(thighCircum) : null,
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        postureNotes: postureNotes || null,
        postureImages: postureImages || null,
        flexibility: flexibility || null,
        balance: balance || null,
        cardioNotes: cardioNotes || null,
        pushups: pushups ? parseInt(pushups) : null,
        situps: situps ? parseInt(situps) : null,
        squats: squats ? parseInt(squats) : null,
        plankTimeSec: plankTimeSec ? parseInt(plankTimeSec) : null,
        feedback: feedback || null,
      }
    });

    return res.status(200).json({ message: 'Avaliação atualizada com sucesso', assessment: updatedAssessment });
  } catch (err) {
    console.error('Erro ao atualizar avaliação:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Avaliação não encontrada.' });
    return res.status(500).json({ error: 'Erro interno ao atualizar.' });
  }
};

module.exports = {
  createPhysicalAssessment,
  getAssessmentsByClient,
  getAssessmentById,
  updatePhysicalAssessment
};