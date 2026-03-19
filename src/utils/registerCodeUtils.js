const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Função para gerar o hash do código
const hashRegisterCode = async (registration_code) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(registration_code, salt);
};

// Função para verificar a código
const compareRegisterCode = async (registration_code, registration_code_hash) => {
  return bcrypt.compare(registration_code, registration_code_hash);
};

module.exports = {
  hashRegisterCode,
  compareRegisterCode
};