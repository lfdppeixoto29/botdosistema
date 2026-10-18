const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function forceDeployWithGit() {
  try {
    console.log("📦 Preparando repositório Git local...");
    
    // Configurar git se não estiver configurado
    try { execSync('git config --global user.email "bot@evolution.com"', { stdio: 'ignore' }); } catch(e){}
    try { execSync('git config --global user.name "Evolution Bot"', { stdio: 'ignore' }); } catch(e){}

    try { execSync('git init', { cwd: 'G:\\evolution bot', stdio: 'ignore' }); } catch(e){}
    try { execSync('git remote add origin https://github.com/lfdppeixoto29/botdosistema.git', { cwd: 'G:\\evolution bot', stdio: 'ignore' }); } catch(e){}

    execSync('git add .', { cwd: 'G:\\evolution bot', stdio: 'inherit' });
    execSync('git commit -m "Atualizacao completa: sub-menus tecnicos e persistencia"', { cwd: 'G:\\evolution bot', stdio: 'inherit' });
    
    console.log("🚀 Enviando para o GitHub (master)...");
    execSync('git push -u origin master --force', { cwd: 'G:\\evolution bot', stdio: 'inherit' });

    console.log("✅ Código enviado para o GitHub com sucesso! A Render vai atualizar a página online agora.");

    // Acionar redeploy na Render
    const listRes = await axios.get('https://api.render.com/v1/services', {
      headers: { 'Authorization': 'Bearer rnd_Y8lFiBkqCfNAU4HGi80pCWeO7Yfu' }
    });
    
    for (const item of listRes.data) {
      const s = item.service;
      if (s.name.includes('botdosistema')) {
        const deployRes = await axios.post(`https://api.render.com/v1/services/${s.id}/deploys`, {}, {
          headers: { 'Authorization': 'Bearer rnd_Y8lFiBkqCfNAU4HGi80pCWeO7Yfu' }
        });
        console.log('🌐 Redeploy acionado na Render para:', s.name);
      }
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

forceDeployWithGit();
