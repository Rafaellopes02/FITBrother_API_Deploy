const prisma = require('../prisma');
const { Prisma } = require('@prisma/client');

const dayMap = {
  'MONDAY': 'WEEK_DAY_0',
  'TUESDAY': 'WEEK_DAY_1',
  'WEDNESDAY': 'WEEK_DAY_2',
  'THURSDAY': 'WEEK_DAY_3',
  'FRIDAY': 'WEEK_DAY_4',
  'SATURDAY': 'WEEK_DAY_5',
  'SUNDAY': 'WEEK_DAY_6',
  '6': 'WEEK_DAY_0',
  '1': 'WEEK_DAY_1',
  '2': 'WEEK_DAY_2',
  '3': 'WEEK_DAY_3',
  '4': 'WEEK_DAY_4',
  '5': 'WEEK_DAY_5',
  '6': 'WEEK_DAY_6',
};

const getPrismaDayEnum = (input) => {
  if (typeof input === 'string') {
    return dayMap[input.toUpperCase()];
  }
  if (typeof input === 'number') {
    return dayMap[input.toString()];
  }
  return undefined;
};

const parseTime = (timeString) => {
  if (!timeString || !/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
    return null; 
  }
  return new Date(`1970-01-01T${timeString}`);
};


const createSchedule = async (req, res) => {
  const { anamnesis_id, slots } = req.body;
  if (!anamnesis_id || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ error: 'anamnesis_id e array de slots são obrigatórios.' });
  }

  const dataToInsert = [];

  for (const s of slots) {
    if (s.week_day === undefined || !s.start_hour || !s.end_hour) {
      return res.status(400).json({ error: 'Cada slot precisa de week_day, start_hour e end_hour.' });
    }

    const prismaWeekDay = getPrismaDayEnum(s.week_day);
    if (!prismaWeekDay) {
      return res.status(400).json({ error: `week_day inválido: ${s.week_day}` });
    }
    
    const startHour = parseTime(s.start_hour);
    const endHour = parseTime(s.end_hour);

    if (!startHour || !endHour) {
      return res.status(400).json({ error: `Formato de hora inválido. Use "HH:mm:ss" (ex: "14:30:00"). Recebido: ${s.start_hour} / ${s.end_hour}` });
    }

    dataToInsert.push({
      anamnesisId: parseInt(anamnesis_id),
      weekDay: prismaWeekDay,
      startHour: startHour,
      endHour: endHour
    });
  }

  try {
    const result = await prisma.schedule.createMany({
      data: dataToInsert,
      skipDuplicates: false,
    });

    const createdSlots = await prisma.schedule.findMany({
      where: { anamnesisId: parseInt(anamnesis_id) }
    });

    return res.status(201).json({ message: 'Horários criados', count: result.count, slots: createdSlots });

  } catch (err) {
    console.error('Erro ao criar schedule:', err);
    return res.status(500).json({ error: 'Erro interno ao inserir horários.' });
  }
};

const getScheduleByAnamnesis = async (req, res) => {
  const { anamnesis_id } = req.params;
  if (!anamnesis_id) {
    return res.status(400).json({ error: 'Parâmetro anamnesis_id é obrigatório.' });
  }
  try {
    const slots = await prisma.schedule.findMany({
      where: { anamnesisId: parseInt(anamnesis_id) },
      orderBy: [
        { weekDay: 'asc' },
        { startHour: 'asc' }
      ]
    });
    
    return res.status(200).json({ slots: slots });

  } catch (err) {
    console.error('Erro ao buscar schedule:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar horários.' });
  }
};

const updateScheduleSlot = async (req, res) => {
  const { id } = req.params;
  const { week_day, start_hour, end_hour } = req.body;
  if (!week_day || !start_hour || !end_hour) {
    return res.status(400).json({ error: 'week_day, start_hour e end_hour são obrigatórios.' });
  }

  const prismaWeekDay = getPrismaDayEnum(week_day);
  if (!prismaWeekDay) {
    return res.status(400).json({ error: `week_day inválido: ${week_day}` });
  }

  const startHour = parseTime(start_hour);
  const endHour = parseTime(end_hour);

  if (!startHour || !endHour) {
      return res.status(400).json({ error: `Formato de hora inválido. Use "HH:mm:ss".` });
  }

  try {
    const updatedSlot = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        weekDay: prismaWeekDay,
        startHour: startHour,
        endHour: endHour
      }
    });
    
    return res.status(200).json({ message: 'Slot atualizado', slot: updatedSlot });

  } catch (err) {
    console.error('Erro ao atualizar schedule:', err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Slot não encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao atualizar horário.' });
  }
};

const deleteScheduleSlot = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'ID do slot é obrigatório.' });
  }
  try {
    await prisma.schedule.delete({
      where: { id: parseInt(id) }
    });
    
    return res.status(200).json({ message: 'Slot apagado com sucesso.' });

  } catch (err) {
    console.error('Erro ao apagar schedule:', err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Slot não encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao apagar horário.' });
  }
};

const getAllowedDaysByClient = async (req, res) => {
  const { client_id } = req.params;

  if (!client_id) {
    return res.status(400).json({ error: 'Parâmetro client_id é obrigatório.' });
  }

  try {
    // 1. Busca a anamnese associada ao cliente
    const anamnesis = await prisma.anamnesis.findFirst({
      where: { clientId: parseInt(client_id) },
      select: { id: true }
    });

    if (!anamnesis) {
      return res.status(404).json({ error: 'Anamnese não encontrada para este cliente.' });
    }

    // 2. Busca os dias da semana configurados no schedule
    const slots = await prisma.schedule.findMany({
      where: { anamnesisId: anamnesis.id },
      select: { weekDay: true }
    });

    // 3. Mapeia o Enum (WEEK_DAY_0) de volta para número (0-6) para o frontend
    // Baseado no seu dayMap: WEEK_DAY_0 = 0 (Segunda ou Domingo dependendo da sua regra)
    const allowedDays = slots.map(slot => {
      const match = slot.weekDay.match(/\d+$/); // Extrai o número do final da string WEEK_DAY_X
      return match ? parseInt(match[0]) : null;
    }).filter((value, index, self) => value !== null && self.indexOf(value) === index);

    return res.status(200).json({ allowedDays });

  } catch (err) {
    console.error('Erro ao buscar dias permitidos:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar dias de treino.' });
  }
};

module.exports = {
  createSchedule,
  getScheduleByAnamnesis,
  updateScheduleSlot,
  deleteScheduleSlot,
  getAllowedDaysByClient
};