const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Função para gerar o hash da senha
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

// Função para verificar a senha
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};