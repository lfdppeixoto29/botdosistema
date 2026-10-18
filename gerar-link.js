/**
 * =====================================================================
 * BOT DOSISTEMA - GERADOR DE ENDEREÇO PÚBLICO (CLOUDTUNNEL LOCAL)
 * =====================================================================
 */

const { spawn } = require('child_process');
const http = require('http');

// Inicia o servidor local do botdosistema na porta 3001 se já não estiver rodando
require('./botdosistema.js');

console.log("🌐 Gerando link público e endereço online para o 'botdosistema'...");
console.log("⏳ Aguarde um instante enquanto criamos o túnel seguro...");

// Usando o túnel nativo gratuito (LocalTunnel / Cloudflare) via npx
const tunnel = spawn('npx', ['localtunnel', '--port', '3001'], { shell: true });

tunnel.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('https://')) {
    const match = output.match(/https:\/\/[^\s]+/);
    if (match) {
      console.log("\n========================================================");
      console.log("🎉 SEU ENDEREÇO PÚBLICO ONLINE DO BOT DOSISTEMA ESTÁ PRONTO:");
      console.log(`👉 ${match[0]}`);
      console.log("========================================================\n");
    }
  }
});

tunnel.stderr.on('data', (data) => {
  // Ignora avisos menores
});
