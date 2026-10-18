/**
 * =====================================================================
 * BOT DOSISTEMA - MULTI-ZAPS ISOLADOS & PAINEL ADMIN 100% DINÂMICO
 * =====================================================================
 */

process.on('uncaughtException', (err) => {
  console.error('❌ Erro não tratado capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rejeição não tratada:', reason);
});

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys');
const QRCode = require('qrcode');
const axios = require('axios');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const express = require('express');
require('dotenv').config();

const GLOBAL_CONFIG = {
  PORT: process.env.PORT || 3001,
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_MODEL: "qwen/qwen3.8-27b"
};

// 1. AUTO PING / KEEP-ALIVE (Impedir que a Render durma)
function keepAlive() {
  const url = `https://botdosistema-luiz.onrender.com/ping`;
  setInterval(async () => {
    try {
      await axios.get(url);
      console.log('📡 Keep-Alive: Ping de manutenção enviado.');
    } catch (e) {}
  }, 30000); // 30 segundos
}

const instances = {};
const CONFIG_FILE = path.join(__dirname, 'configs.json');

// Configuração Padrão Absoluta
const absoluteDefaultConfig = {
  botName: "Luiz Fernando",
  lunchActive: true,
  lunchMsg: "🍽️ *Horário de Almoço*\n\nOlá! No momento estamos em horário de almoço (das 12h às 13h). Sua solicitação foi registrada e retornaremos às 13h!",
  menuOptions: [
    { 
      id: "1", 
      title: "Trabalho", 
      subRequests: [
        { title: "Informe Empresa", description: "Identificação da empresa." },
        { title: "Dados de Equipamento", description: "Dados técnicos de hardware." },
        { title: "Registo de Ocorrência", description: "Detalhes da avaria ou anomalia." },
        { title: "Pedido de Configuração", description: "Parâmetros de configuração." }
      ]
    },
    { 
      id: "2", 
      title: "Particular", 
      subRequests: [] 
    }
  ]
};

function saveConfigsToDisk() {
  try {
    const dataToSave = {};
    Object.keys(instances).forEach(name => {
      dataToSave[name] = instances[name].config;
    });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(dataToSave, null, 2));
  } catch (err) {
    console.error('❌ Erro ao salvar:', err);
  }
}

function loadConfigsFromDisk() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {}
  return { principal: absoluteDefaultConfig };
}

function getWelcomeMenuText(pushName, config) {
  let menu = `╔══════════════════════╗\n`;
  menu += `   🤖 *ASSISTENTE VIRTUAL*\n`;
  menu += `   👤 *${config.botName}*\n`;
  menu += `╚══════════════════════╝\n\n`;
  menu += `👋 Olá, *${pushName}*! Como posso ajudar hoje?\n\n`;
  menu += `Escolha uma opção enviando apenas o número:\n`;
  
  config.menuOptions.forEach(opt => {
    menu += `\n  🔹 *[ ${opt.id} ]* ➔ ${opt.title}`;
  });

  menu += `\n\n────────────────────────\n`;
  menu += `_💡 Digite o número ou *menu* para reiniciar._`;
  return menu;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cabeçalhos anti-cache para o Painel Admin
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/config', (req, res) => res.sendFile(path.join(__dirname, 'config-instance.html')));

app.get('/api/admin/data', (req, res) => {
  const instancesConfigs = {};
  const statuses = {};
  Object.keys(instances).forEach(name => {
    instancesConfigs[name] = instances[name].config;
    statuses[name] = instances[name].status;
  });
  res.json({ instancesConfigs, statuses });
});

app.post('/api/admin/config', (req, res) => {
  const { instanceName, botName, lunchActive, lunchMsg, menuOptions } = req.body;
  if (!instances[instanceName]) return res.status(400).json({ error: "Inválido" });

  const cfg = instances[instanceName].config;
  if (botName) cfg.botName = botName;
  cfg.lunchActive = !!lunchActive;
  if (lunchMsg) cfg.lunchMsg = lunchMsg;
  if (menuOptions) cfg.menuOptions = menuOptions;

  saveConfigsToDisk();
  res.json({ success: true, message: "Salvo!" });
});

app.post('/api/instances', (req, res) => {
  const { instanceName } = req.body;
  const cleanName = instanceName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (!instances[cleanName]) startBotInstance(cleanName);
  res.json({ success: true, name: cleanName });
});

app.get('/qr/:name', async (req, res) => {
  const inst = instances[req.params.name];
  if (!inst) return res.status(404).send("Não encontrado");
  if (inst.status === "Conectado") return res.send(`<h1>🎉 WhatsApp ${req.params.name} Conectado!</h1>`);
  if (!inst.qr) return res.send(`<h1>⏳ Gerando QR...</h1><script>setTimeout(()=>location.reload(),3000)</script>`);
  const qrImage = await QRCode.toDataURL(inst.qr);
  res.send(`<h1>📱 Escaneie o QR: ${req.params.name}</h1><img src="${qrImage}"><script>setTimeout(()=>location.reload(),10000)</script>`);
});

app.listen(GLOBAL_CONFIG.PORT, '0.0.0.0', () => {
  console.log(`🌐 Servidor rodando na porta ${GLOBAL_CONFIG.PORT}`);
  keepAlive();
  const saved = loadConfigsFromDisk();
  Object.keys(saved).forEach(name => startBotInstance(name, saved[name]));
});

// =========================================
// MOTOR DO BOT (100% DINÂMICO)
// =========================================
const userSessions = {};

async function startBotInstance(instanceName, customConfig = null) {
  // FORCE DELETE AUTH FOLDER TO FIX QR GENERATION
  const authPath = path.join(__dirname, `auth_info_${instanceName}`);
  try { fs.rmSync(authPath, { recursive: true, force: true }); } catch (e) {}
  fs.mkdirSync(authPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const baseConfig = JSON.parse(JSON.stringify(absoluteDefaultConfig));
  let finalConfig = customConfig || baseConfig;
  finalConfig.menuOptions = baseConfig.menuOptions;

  if (!instances[instanceName]) {
    instances[instanceName] = { qr: null, status: "Iniciando...", config: finalConfig, sock: null };
  } else {
    instances[instanceName].config = finalConfig;
  }
  
  const inst = instances[instanceName];

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ["Ubuntu", "Chrome", "20.0.0"]
  });

  inst.sock = sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    const { connection, qr } = u;
    if (qr) { inst.qr = qr; inst.status = "Aguardando Leitura"; }
    if (connection === 'open') { inst.status = "Conectado"; inst.qr = null; }
    if (connection === 'close') { inst.status = "Desconectado"; setTimeout(() => startBotInstance(instanceName), 5000); }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid.includes('@g.us')) return;

    const jid = msg.key.remoteJid;
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
    if (!text) return;

    const pushName = msg.pushName || 'Cliente';
    const sessionKey = `${instanceName}_${jid}`;
    if (!userSessions[sessionKey]) userSessions[sessionKey] = { step: 'MENU' };
    const sess = userSessions[sessionKey];
    const cfg = inst.config;

    const hour = new Date().getHours();
    const isLunch = (hour >= 12 && hour < 13);

    try {
      let reply = "";
      if (text.toLowerCase() === 'menu') {
        sess.step = 'MENU';
        reply = getWelcomeMenuText(pushName, cfg);
      } else if (sess.step === 'MENU') {
        const opt = cfg.menuOptions.find(o => o.id === text);
        if (opt) {
          sess.opt = opt;
          const isTrab = opt.title.toLowerCase().includes('trabalho');
          if (cfg.lunchActive && isTrab && isLunch) {
            reply = `${cfg.lunchMsg}\n\n*(Digite **menu** para voltar)*`;
          } else if (opt.subRequests && opt.subRequests.length > 0) {
            sess.step = 'SUB';
            reply = `📌 *${opt.title}*\nEscolha uma opção:\n`;
            opt.subRequests.forEach((r, i) => reply += `\n  🔹 *[ ${i+1} ]* ➔ ${r.title}`);
          } else {
            sess.step = 'NOME';
            reply = `👤 *${opt.title}*\nInforme seu *Nome Completo*:`;
          }
        } else {
          reply = getWelcomeMenuText(pushName, cfg);
        }
      } else if (sess.step === 'SUB') {
        const subIdx = parseInt(text) - 1;
        if (sess.opt.subRequests && sess.opt.subRequests[subIdx]) {
          sess.sub = sess.opt.subRequests[subIdx];
          sess.step = 'NOME';
          reply = `✅ *${sess.sub.title}*\nInforme seu *Nome Completo*:`;
        } else {
          reply = "❌ Opção inválida.";
        }
      } else if (sess.step === 'NOME') {
        sess.userName = text;
        sess.step = 'FIM';
        reply = `✅ Obrigado, *${sess.userName}*!\n\nAgora, descreva sua dúvida ou solicitação:`;
      } else if (sess.step === 'FIM') {
        const aiRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: GLOBAL_CONFIG.AI_MODEL,
          messages: [
            { role: 'system', content: `Você é o assistente de ${cfg.botName}. Responda profissionalmente.` },
            { role: 'user', content: text }
          ]
        }, { headers: { 'Authorization': `Bearer ${GLOBAL_CONFIG.AI_API_KEY}` } }).catch(() => null);
        reply = aiRes ? aiRes.data.choices[0].message.content : "Entraremos em contato em breve.";
      }
      await sock.sendMessage(jid, { text: reply });
    } catch (e) { console.error(e); }
  });
}
