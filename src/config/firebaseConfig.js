const admin = require('firebase-admin');

// 1. O Render cria a variável de ambiente 'RENDER' automaticamente.
// Se estiver no Render, vai buscar ao cofre secreto. 
// Se for no teu Mac, assume que o ficheiro está na mesma pasta.
const serviceAccountPath = process.env.RENDER 
  ? '/etc/secrets/firebase-service-account.json' 
  : './firebase-service-account.json';

try {
  // 2. Carregar o ficheiro JSON
  const serviceAccount = require(serviceAccountPath);

  // 3. Inicializar o Firebase (verificando se já não foi inicializado antes)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ [Firebase] SDK inicializado com sucesso!');
  }
} catch (error) {
  console.error(`❌ [Firebase] Erro ao carregar as credenciais no caminho: ${serviceAccountPath}`);
  console.error(error.message);
}

module.exports = admin;