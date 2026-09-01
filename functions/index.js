const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// ============================================================
// VALIDAÇÃO DE MOVIMENTOS
// ============================================================
exports.validarMovimento = functions.https.onCall(async (data, context) => {
  // Verifica autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { salaId, movimento, tipo } = data;
  if (!salaId || !movimento) {
    throw new functions.https.HttpsError('invalid-argument', 'Dados inválidos');
  }

  // Busca a sala
  const salaRef = admin.firestore().collection('salas').doc(salaId);
  const sala = await salaRef.get();
  if (!sala.exists) {
    throw new functions.https.HttpsError('not-found', 'Sala não encontrada');
  }

  const dados = sala.data();
  
  // Verifica se o jogador está na sala
  if (dados.jogador1 !== context.auth.uid && dados.jogador2 !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Você não está na sala');
  }

  // Verifica se é a vez do jogador
  const jogadorIndex = dados.jogador1 === context.auth.uid ? 0 : 1;
  if (dados.turno !== jogadorIndex) {
    throw new functions.https.HttpsError('failed-precondition', 'Não é sua vez');
  }

  // VALIDAÇÃO DO MOVIMENTO
  // (Aqui você pode adicionar regras específicas)
  
  return { valido: true };
});

// ============================================================
// LIMITE DE REQUISIÇÕES (RATE LIMITING)
// ============================================================
exports.rateLimit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const uid = context.auth.uid;
  const agora = Date.now();
  const limite = 30; // 30 requisições
  const janela = 60000; // por minuto

  // Busca ou cria registro de rate limit
  const rateRef = admin.firestore().collection('rate_limits').doc(uid);
  const doc = await rateRef.get();
  
  if (doc.exists) {
    const dados = doc.data();
    const diff = agora - dados.ultimaReset;
    
    if (diff < janela) {
      if (dados.contagem >= limite) {
        throw new functions.https.HttpsError('resource-exhausted', 'Limite de requisições excedido');
      }
      await rateRef.update({ contagem: dados.contagem + 1 });
    } else {
      await rateRef.set({ contagem: 1, ultimaReset: agora });
    }
  } else {
    await rateRef.set({ contagem: 1, ultimaReset: agora });
  }

  return { success: true };
});
