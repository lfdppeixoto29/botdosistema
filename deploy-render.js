const axios = require('axios');

async function deploy() {
  try {
    console.log("🚀 Enviando solicitação de deploy para a Render...");
    const res = await axios.post('https://api.render.com/v1/services', {
      type: 'web_service',
      name: 'botdosistema-luiz',
      ownerId: 'tea-db7uncmq1p3s739kpg7g',
      repo: 'https://github.com/lfdppeixoto29/botdosistema',
      branch: 'master',
      serviceDetails: {
        env: 'node',
        plan: 'free',
        buildCommand: 'npm install',
        startCommand: 'node botdosistema.js'
      }
    }, {
      headers: { 'Authorization': 'Bearer rnd_Y8lFiBkqCfNAU4HGi80pCWeO7Yfu' }
    });
    console.log('✅ DEPLOY CRIADO COM SUCESSO NA RENDER!');
    console.log('🌐 URL do serviço:', res.data.service.serviceDetails.url);
  } catch (err) {
    console.error('❌ Erro no deploy:', err.response?.data || err.message);
  }
}

deploy();
