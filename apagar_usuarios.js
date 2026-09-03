const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.auth().listUsers(1000).then(listUsers => {
  const uids = listUsers.users.map(user => user.uid);
  if (uids.length === 0) {
    console.log('Nenhum usuário para apagar.');
    return;
  }
  return admin.auth().deleteUsers(uids);
}).then(result => {
  console.log(`✅ ${result.successCount} usuários apagados.`);
}).catch(err => {
  console.error('Erro:', err);
});
