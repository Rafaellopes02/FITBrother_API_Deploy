const prisma = require('../prisma');
const { Prisma } = require('@prisma/client');

// ==========================================
// 1. FUNÇÕES AUXILIARES DE MAPEAMENTO (ESSENCIAIS)
// ==========================================

// Converte um valor simples (ex: 1) para o Enum do Prisma (ex: "GENDER_1")
// Se o valor for null/undefined, retorna undefined (ignora).
const mapToEnum = (prefix, value) => {
  if (value === null || value === undefined || value === "") return undefined;
  return `${prefix}_${value}`;
};

// Converte um Array de números (ex: [1, 2]) para Array de Enums (ex: ["GOAL_1", "GOAL_2"])
const mapToEnumArray = (prefix, values) => {
  if (!values || !Array.isArray(values) || values.length === 0) return [];
  return values.map(v => `${prefix}_${v}`);
};

// ==========================================
// 2. ANAMNESE COMPLETA
// ==========================================
const createCompleteAnamnesis = async (req, res) => {
  const {
    client_id, trainer_id, parent_user_id,
    full_name, age, gender, weight_kg, height_cm, occupation, occupation_other,
    medical_conditions, medical_condition_other, spine_joint_injuries, injury_description,
    regular_medication, medication_description, allergies, allergy_description, last_medical_exam,
    activity_level, training_experience, exercise_types, exercise_other,
    goals, goal_other, specific_goal, training_availability,
    nutrition_type, nutrition_other, eats_processed_food, sleep_hours, stress_level, stress_comments,
    had_personal_trainer, personal_trainer_experience, wants_progress_tracking
  } = req.body;

  if (!client_id || !full_name) {
    return res.status(400).json({ error: 'Campos obrigatórios (client_id, full_name) em falta.' });
  }

  const finalTrainerId = trainer_id ? parseInt(trainer_id) : (parent_user_id ? parseInt(parent_user_id) : null);
  
  try {
    const prismaData = {
      // --- Pessoais ---
      clientId: parseInt(client_id),
      trainerId: finalTrainerId,
      fullName: full_name,
      age: parseInt(age),
      
      // Mapeia 1 -> "GENDER_1", 2 -> "GENDER_2"
      gender: mapToEnum('GENDER', gender), 
      
      weightKg: parseFloat(weight_kg),
      heightCm: parseFloat(height_cm),
      
      // Mapeia 1 -> "OCCUPATION_TYPE_1"
      occupation: mapToEnum('OCCUPATION_TYPE', occupation),
      occupationOther: occupation_other,

      // --- Saúde ---
      // Mapeia [1, 2] -> ["MEDICAL_CONDITION_1", "MEDICAL_CONDITION_2"]
      medicalConditions: mapToEnumArray('MEDICAL_CONDITION', medical_conditions), 
      medicalConditionOther: medical_condition_other,
      spineJointInjuries: spine_joint_injuries,
      injuryDescription: injury_description,
      regularMedication: regular_medication,
      medicationDescription: medication_description,
      allergies: allergies,
      allergyDescription: allergy_description,
      lastMedicalExam: last_medical_exam ? new Date(last_medical_exam) : null,

      // --- Atividade ---
      activityLevel: mapToEnum('ACTIVITY_LEVEL', activity_level),
      trainingExperience: mapToEnum('TRAINING_EXPERIENCE', training_experience),
      exerciseTypes: mapToEnumArray('EXERCISE_TYPE', exercise_types), 
      exerciseOther: exercise_other,

      // --- Objetivos ---
      goals: mapToEnumArray('GOAL', goals), 
      goalOther: goal_other,
      specificGoal: specific_goal,
      trainingAvailability: mapToEnum('TRAINING_AVAILABILITY', training_availability),

      // --- Nutrição ---
      nutritionType: mapToEnum('NUTRITION_TYPE', nutrition_type),
      nutritionOther: nutrition_other,
      eatsProcessedFood: mapToEnum('PROCESSED_FOOD', eats_processed_food),
      sleepHours: parseInt(sleep_hours),
      stressLevel: mapToEnum('STRESS_LEVEL', stress_level),
      stressComments: stress_comments,

      // --- Outros ---
      hadPersonalTrainer: had_personal_trainer,
      personalTrainerExperience: personal_trainer_experience,
      wantsProgressTracking: wants_progress_tracking
    };

    const newAnamnesis = await prisma.anamnesis.create({
      data: prismaData,
      select: { id: true }
    });
    
    return res.status(201).json({ message: 'Anamnese criada!', anamnesis_id: newAnamnesis.id });
  
  } catch (err) {
    console.error('ERRO PRISMA:', err.message);
    
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Dados duplicados.', details: err.meta });
    }
    
    return res.status(500).json({ error: 'Erro ao gravar anamnese.', details: err.message });
  }
};

// ==========================================
// FUNÇÕES INDIVIDUAIS
// ==========================================

const createAnamnesisPersonal = async (req, res) => {
  const { client_id, trainer_id, full_name, age, gender, weight_kg, height_cm, occupation, occupation_other } = req.body;
  if (!client_id || !trainer_id || !full_name) return res.status(400).json({ error: 'Faltam campos.' });
  try {
    const newAnamnesis = await prisma.anamnesis.create({
      data: {
        clientId: parseInt(client_id),
        trainerId: parseInt(trainer_id),
        fullName: full_name,
        age: parseInt(age),
        gender: mapToEnum('GENDER', gender),
        weightKg: parseFloat(weight_kg),
        heightCm: parseFloat(height_cm),
        occupation: mapToEnum('OCCUPATION_TYPE', occupation),
        occupationOther: occupation_other
      },
      select: { id: true }
    });
    return res.status(201).json({ message: 'Criado', anamnesis_id: newAnamnesis.id });
  } catch (err) { return res.status(500).json({ error: err.message }); }
};

const updateAnamnesisHealth = async (req, res) => { res.json({msg: "Use updateComplete"}) };
const updateAnamnesisActivity = async (req, res) => { res.json({msg: "Use updateComplete"}) };
const updateAnamnesisGoals = async (req, res) => { res.json({msg: "Use updateComplete"}) };
const updateAnamnesisNutrition = async (req, res) => { res.json({msg: "Use updateComplete"}) };
const updateAnamnesisOther = async (req, res) => { res.json({msg: "Use updateComplete"}) };

const updateCompleteAnamnesis = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const keys = Object.keys(updates);
  if (!keys.length) return res.status(400).json({ error: 'Nada para atualizar.' });

  const dataToUpdate = {};
  
  // Mapeamento manual para garantir tipos e enums corretos
  if (updates.client_id) dataToUpdate.clientId = parseInt(updates.client_id);
  if (updates.trainer_id) dataToUpdate.trainerId = parseInt(updates.trainer_id);
  if (updates.full_name) dataToUpdate.fullName = updates.full_name;
  if (updates.age) dataToUpdate.age = parseInt(updates.age);
  
  // Enums Simples
  if (updates.gender !== undefined) dataToUpdate.gender = mapToEnum('GENDER', updates.gender);
  if (updates.occupation !== undefined) dataToUpdate.occupation = mapToEnum('OCCUPATION_TYPE', updates.occupation);
  if (updates.activity_level !== undefined) dataToUpdate.activityLevel = mapToEnum('ACTIVITY_LEVEL', updates.activity_level);
  if (updates.training_experience !== undefined) dataToUpdate.trainingExperience = mapToEnum('TRAINING_EXPERIENCE', updates.training_experience);
  if (updates.training_availability !== undefined) dataToUpdate.trainingAvailability = mapToEnum('TRAINING_AVAILABILITY', updates.training_availability);
  if (updates.nutrition_type !== undefined) dataToUpdate.nutritionType = mapToEnum('NUTRITION_TYPE', updates.nutrition_type);
  if (updates.eats_processed_food !== undefined) dataToUpdate.eatsProcessedFood = mapToEnum('PROCESSED_FOOD', updates.eats_processed_food);
  if (updates.stress_level !== undefined) dataToUpdate.stressLevel = mapToEnum('STRESS_LEVEL', updates.stress_level);

  // Arrays de Enums
  if (updates.medical_conditions) dataToUpdate.medicalConditions = mapToEnumArray('MEDICAL_CONDITION', updates.medical_conditions);
  if (updates.exercise_types) dataToUpdate.exerciseTypes = mapToEnumArray('EXERCISE_TYPE', updates.exercise_types);
  if (updates.goals) dataToUpdate.goals = mapToEnumArray('GOAL', updates.goals);

  // Outros campos
  if (updates.weight_kg) dataToUpdate.weightKg = parseFloat(updates.weight_kg);
  if (updates.height_cm) dataToUpdate.heightCm = parseFloat(updates.height_cm);
  if (updates.occupation_other !== undefined) dataToUpdate.occupationOther = updates.occupation_other;
  if (updates.medical_condition_other !== undefined) dataToUpdate.medicalConditionOther = updates.medical_condition_other;
  if (updates.spine_joint_injuries !== undefined) dataToUpdate.spineJointInjuries = updates.spine_joint_injuries;
  if (updates.injury_description !== undefined) dataToUpdate.injuryDescription = updates.injury_description;
  if (updates.regular_medication !== undefined) dataToUpdate.regularMedication = updates.regular_medication;
  if (updates.medication_description !== undefined) dataToUpdate.medicationDescription = updates.medication_description;
  if (updates.allergies !== undefined) dataToUpdate.allergies = updates.allergies;
  if (updates.allergy_description !== undefined) dataToUpdate.allergyDescription = updates.allergy_description;
  if (updates.last_medical_exam) dataToUpdate.lastMedicalExam = new Date(updates.last_medical_exam);
  if (updates.exercise_other !== undefined) dataToUpdate.exerciseOther = updates.exercise_other;
  if (updates.goal_other !== undefined) dataToUpdate.goalOther = updates.goal_other;
  if (updates.specific_goal !== undefined) dataToUpdate.specificGoal = updates.specific_goal;
  if (updates.nutrition_other !== undefined) dataToUpdate.nutritionOther = updates.nutrition_other;
  if (updates.sleep_hours !== undefined) dataToUpdate.sleepHours = parseInt(updates.sleep_hours);
  if (updates.stress_comments !== undefined) dataToUpdate.stressComments = updates.stress_comments;
  if (updates.had_personal_trainer !== undefined) dataToUpdate.hadPersonalTrainer = updates.had_personal_trainer;
  if (updates.personal_trainer_experience !== undefined) dataToUpdate.personalTrainerExperience = updates.personal_trainer_experience;
  if (updates.wants_progress_tracking !== undefined) dataToUpdate.wantsProgressTracking = updates.wants_progress_tracking;

  try {
    const updated = await prisma.anamnesis.update({ where: { id: parseInt(id) }, data: dataToUpdate });
    return res.status(200).json({ message: 'Atualizado', anamnesis: updated });
  } catch (err) { return res.status(500).json({ error: err.message }); }
};

const getAnamnesisByClientId = async (req, res) => {
  const { client_id } = req.params;
  try {
    const anamneses = await prisma.anamnesis.findMany({ where: { clientId: parseInt(client_id) }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ anamneses });
  } catch (e) { return res.status(500).json({ error: e.message }); }
};
const deleteAnamnesisById = async (req, res) => {
  const { id } = req.params;
  try { await prisma.anamnesis.delete({ where: { id: parseInt(id) } }); return res.status(200).json({ message: 'Apagado' }); } catch (e) { return res.status(500).json({ error: e.message }); }
};
const getLastAnamnesisByClientId = async (req, res) => {
  const { client_id } = req.params;
  try {
    const anamnesis = await prisma.anamnesis.findFirst({ where: { clientId: parseInt(client_id) }, orderBy: { createdAt: 'desc' }, select: { id: true } });
    if (!anamnesis) return res.status(404).json({ error: 'Nenhuma' });
    return res.status(200).json({ anamnesis });
  } catch (e) { return res.status(500).json({ error: e.message }); }
};

module.exports = {
  createAnamnesisPersonal,
  updateAnamnesisHealth,
  updateAnamnesisActivity,
  updateAnamnesisGoals,
  updateAnamnesisNutrition,
  updateAnamnesisOther,
  createCompleteAnamnesis,
  updateCompleteAnamnesis,
  getAnamnesisByClientId,
  getLastAnamnesisByClientId,
  deleteAnamnesisById
};