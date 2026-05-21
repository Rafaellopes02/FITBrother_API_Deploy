const prisma = require('../prisma');
const { Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

exports.createExercise = async (req, res) => {
  const { name, sets, repetitions, duration, rest_seconds, demonstration_url } = req.body;

  try {
    const trimmedName = name.trim();

    const checkExisting = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        }
      }
    });

    if (checkExisting) {
      return res.status(409).json({
        error: 'Já existe um exercício com esse nome.'
      });
    }

    // --- LÓGICA DE PROCESSAMENTO DE IMAGEM ---
    let finalImageUrl = demonstration_url;

    if (demonstration_url && demonstration_url.startsWith('data:image')) {
      const mimeType = demonstration_url.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      const extension = mimeType[1].split('/')[1];
      const base64Data = demonstration_url.replace(/^data:image\/\w+;base64,/, "");
      
      // Criar um nome único para o ficheiro
      const fileName = `exercise-${Date.now()}.${extension}`;
      // Caminho absoluto para guardar o ficheiro
      const filePath = path.join(__dirname, '../../uploads/exercises', fileName);

      // Guardar no disco
      fs.writeFileSync(filePath, base64Data, 'base64');

      // URL que será guardada na BD
      const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
      finalImageUrl = `${serverUrl}/uploads/exercises/${fileName}`;
    }

    const newExercise = await prisma.exercise.create({
      data: {
        name: trimmedName,
        sets: parseInt(sets) || 0,
        repetitions: parseInt(repetitions) || 0,
        duration: parseInt(duration) || 0,
        restSeconds: parseInt(rest_seconds) || 0,
        demonstrationUrl: finalImageUrl
      }
    });

    res.status(201).json(newExercise);

  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um exercício com esse nome (constraint falhou).' });
    }
    res.status(500).json({ error: 'Erro ao criar exercício' });
  }
};

exports.getAllExercises = async (_, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(exercises);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar exercícios' });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }
    
    res.json(exercise);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar exercício' });
  }
};

exports.updateExercise = async (req, res) => {
  const { name, sets, repetitions, duration, rest_seconds, demonstration_url } = req.body;
  
  try {
    let finalImageUrl = demonstration_url;

    // Lógica de upload também no Update
    if (demonstration_url && demonstration_url.startsWith('data:image')) {
      const mimeType = demonstration_url.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      const extension = mimeType[1].split('/')[1];
      const base64Data = demonstration_url.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `exercise-${Date.now()}.${extension}`;
      const filePath = path.join(__dirname, '../../uploads/exercises', fileName);

      fs.writeFileSync(filePath, base64Data, 'base64');
      const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
      finalImageUrl = `${serverUrl}/uploads/exercises/${fileName}`;
    }

    const updatedExercise = await prisma.exercise.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: name,
        sets: parseInt(sets),
        repetitions: parseInt(repetitions),
        duration: parseInt(duration),
        restSeconds: parseInt(rest_seconds),
        demonstrationUrl: finalImageUrl
      }
    });
    
    res.json(updatedExercise);

  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Exercício não encontrado.' });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um exercício com esse nome.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar exercício' });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    await prisma.exercise.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ message: 'Exercício removido' });

  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Exercício não encontrado.' });
    }
    res.status(500).json({ error: 'Erro ao apagar exercício' });
  }
};