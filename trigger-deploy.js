const axios = require('axios');

async function trigger() {
  try {
    // 1. Listar serviços
    const listRes = await axios.get('https://api.render.com/v1/services', {
      headers: { 'Authorization': 'Bearer rnd_Y8lFiBkqCfNAU4HGi80pCWeO7Yfu' }
    });
    
    const services = listRes.data;
    console.log("Serviços encontrados:", services.map(s => ({ id: s.service.id, name: s.service.name })));

    for (const item of services) {
      const s = item.service;
      if (s.name.includes('botdosistema')) {
        console.log(`🚀 Acionando redeploy para o serviço: ${s.name} (${s.id})`);
        const deployRes = await axios.post(`https://api.render.com/v1/services/${s.id}/deploys`, {}, {
          headers: { 'Authorization': 'Bearer rnd_Y8lFiBkqCfNAU4HGi80pCWeO7Yfu' }
        });
        console.log('✅ DEPLOY ACIONADO COM SUCESSO!', deployRes.data);
      }
    }
  } catch (err) {
    console.error('❌ Erro:', err.response?.data || err.message);
  }
}

trigger();
