const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const userRoutes = require('./routes/userRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const anamnesisRoutes = require('./routes/anamnesisRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const exercisesRoutes = require('./routes/exercisesRoutes');
const prisma = require('./prisma');
const app = express();
app.use('/uploads', express.static('uploads'));

require('dotenv').config();

BigInt.prototype.toJSON = function() { 
  return this.toString(); 
};
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de FITBrother',
      version: '1.0.0',
      description: 'API para o FITBrother',
    },
    tags: [
      { name: 'Anamnesis', description: 'Rotas relacionadas à anamnese dos usuários' },
      { name: 'Exercises', description: 'Gestão de exercícios' },
      { name: 'Schedule', description: 'Endpoints para gerenciamento de horários' },
      { name: 'Users', description: 'Operações de Utilizadores' },
      { name: 'Workouts', description: 'Gerenciamento de treinos' },
    ],
    components: {
      schemas: {
        AnamnesisPersonal: {
          type: 'object',
          properties: {
            client_id: { type: 'integer' },
            trainer_id: { type: 'integer' },
            full_name: { type: 'string' },
            age: { type: 'integer' },
            gender: { type: 'string', enum: ['0', '1', '2'], description: '0 = Male, 1 = Female, 2 = Other' },
            weight_kg: { type: 'number' },
            height_cm: { type: 'number' },
            occupation: { type: 'string', enum: ['0', '1', '2', '3'], description: '0 = Sedentary, 1 = Moderate, 2 = Intense, 3 = Other' },
            occupation_other: { type: 'string' },
          },
          required: ['client_id', 'trainer_id', 'full_name', 'age', 'gender', 'weight_kg', 'height_cm', 'occupation'],
        },
        AnamnesisHealth: {
          type: 'object',
          properties: {
            medical_conditions: {
              type: 'array',
              items: { type: 'string', enum: ['0', '1', '2', '3', '4', '5'] },
              description: '0 = Hypertension, 1 = Diabetes, ...',
            },
            medical_condition_other: { type: 'string' },
            spine_joint_injuries: { type: 'boolean' },
            injury_description: { type: 'string' },
            regular_medication: { type: 'boolean' },
            medication_description: { type: 'string' },
            allergies: { type: 'boolean' },
            allergy_description: { type: 'string' },
            last_medical_exam: { type: 'string', format: 'date' },
          },
          required: ['medical_conditions'],
        },
        AnamnesisActivity: {
          type: 'object',
          properties: {
            activity_level: { type: 'string', enum: ['0', '1', '2', '3'] },
            training_experience: { type: 'string', enum: ['0', '1', '2', '3'] },
            exercise_types: { type: 'array', items: { type: 'string', enum: ['0', '1', '2', '3', '4'] } },
            exercise_other: { type: 'string' },
          },
          required: ['activity_level', 'training_experience', 'exercise_types'],
        },
        AnamnesisGoals: {
          type: 'object',
          properties: {
            goals: { type: 'array', items: { type: 'string', enum: ['0', '1', '2', '3', '4', '5', '6'] } },
            goal_other: { type: 'string' },
            specific_goal: { type: 'string' },
            training_availability: { type: 'string', enum: ['0', '1', '2'] },
          },
          required: ['goals', 'training_availability'],
        },
        AnamnesisNutrition: {
          type: 'object',
          properties: {
            nutrition_type: { type: 'string', enum: ['0', '1', '2', '3'] },
            nutrition_other: { type: 'string' },
            eats_processed_food: { type: 'string', enum: ['0', '1', '2'] },
            sleep_hours: { type: 'integer', minimum: 4, maximum: 10 },
            stress_level: { type: 'string', enum: ['0', '1', '2'] },
            stress_comments: { type: 'string' },
          },
          required: ['nutrition_type', 'eats_processed_food', 'sleep_hours', 'stress_level'],
        },
        AnamnesisOther: {
          type: 'object',
          properties: {
            had_personal_trainer: { type: 'boolean' },
            personal_trainer_experience: { type: 'string' },
            wants_progress_tracking: { type: 'boolean' },
          },
          required: ['had_personal_trainer', 'wants_progress_tracking'],
        },
        Exercise: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            sets: { type: 'integer' },
            repetitions: { type: 'integer' },
            duration: { type: 'integer' },
            rest_seconds: { type: 'integer' },
            demonstration_url: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ScheduleSlot: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            anamnesis_id: { type: 'integer' },
            week_day: { type: 'string' },
            start_hour: { type: 'string', format: 'time' },
            end_hour: { type: 'string', format: 'time' },
          },
        },
        UserInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            confirm_password: { type: 'string' },
            phone: { type: 'integer' },
            user_type: { type: 'string', enum: ['0', '1', '2', '3'] },
            parent_user_id: { type: 'integer' },
            date_of_birth: { type: 'string', format: 'date' },
          },
        },
        Workout: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            trainer_id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Rotas
app.use('/api', userRoutes);
app.use('/api', verifyRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', anamnesisRoutes);
app.use('/api', workoutRoutes);
app.use('/api', exercisesRoutes);

app.get('/', (req, res) => res.send('API funcionando!'));


const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Ligação à BD (Prisma) estabelecida com sucesso.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
    });

  } catch (error) {
    console.error('Erro fatal ao ligar à Base de Dados:');
    console.error(error);
    process.exit(1);
  }
}

const supportRoutes = require('./routes/supportRoutes');
app.use('/api/support', supportRoutes);

startServer();
