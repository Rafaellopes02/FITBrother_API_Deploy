const admin = require('firebase-admin');
const path = require('path');

try {
  // Vai buscar o ficheiro json que guardaste nessa pasta
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('🔥 [Firebase] SDK inicializado com sucesso de forma segura.');
} catch (error) {
  console.error('❌ [Firebase] Erro ao inicializar o SDK:', error.message);
}

module.exports = admin;