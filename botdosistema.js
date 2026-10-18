/**
 * =====================================================================
 * BOT DOSISTEMA - MULTI-ZAPS ISOLADOS & PAINEL ADMIN POR CELULAR
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
  AI_API_KEY: process.env.AI_API_KEY || "SUA_CHAVE_API_AQUI",
  AI_MODEL: "llama-3.1-8b-instant"
};

// 1. AUTO PING / KEEP-ALIVE (Para nunca desconectar no Render)
function keepAlive() {
  const url = `https://botdosistema-luiz.onrender.com/ping`;
  setInterval(async () => {
    try {
      await axios.get(url);
      console.log('📡 Keep-Alive: Ping enviado com sucesso para manter o servidor acordado.');
    } catch (e) {
      console.error('📡 Keep-Alive: Erro ao pingar auto-url.');
    }
  }, 1000 * 60 * 4); // A cada 4 minutos
}

const instances = {};
const CONFIG_FILE = path.join(__dirname, 'configs.json');

const absoluteDefaultConfig = {
  botName: "Luiz Fernando",
  lunchActive: true,
  lunchMsg: "🍽️ *Horário de Almoço*\n\nOlá! No momento estamos em horário de almoço (das 12h às 13h). Sua solicitação foi registrada e retornaremos às 13h!",
  menuOptions: [
    { id: "1", title: "Trabalho", link: "", message: "Setor de Trabalho selecionado. Como posso ajudar?" },
    { id: "2", title: "Particular", link: "", message: "Setor Particular selecionado. Como posso ajudar?" }
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
    console.error('❌ Erro ao salvar configs no disco:', err);
  }
}

function loadConfigsFromDisk() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      const initial = { principal: absoluteDefaultConfig };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.principal && (!parsed.principal.menuOptions || parsed.principal.menuOptions.length === 0)) {
      parsed.principal.menuOptions = absoluteDefaultConfig.menuOptions;
    }
    return parsed;
  } catch (err) {
    console.error('❌ Erro ao carregar configs do disco:', err);
  }
  return { principal: absoluteDefaultConfig };
}

const defaultInstanceConfig = absoluteDefaultConfig;

function getWelcomeMenuText(pushName, config) {
  let menu = `╔══════════════════════╗\n`;
  menu += `   🤖 *ASSISTENTE VIRTUAL*\n`;
  menu += `   👤 *${config.botName}*\n`;
  menu += `╚══════════════════════╝\n\n`;
  menu += `👋 Olá, *${pushName}*! É um prazer falar com você.\n\n`;
  menu += `Para agilizar o seu atendimento, por favor, escolha uma das opções abaixo enviando apenas o número correspondente:\n`;
  
  config.menuOptions.forEach(opt => {
    menu += `\n  🔹 *[ ${opt.id} ]* ➔ ${opt.title}`;
  });

  menu += `\n\n────────────────────────\n`;
  menu += `_💡 Digite o número da opção desejada ou *menu* para reiniciar._`;
  return menu;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/config', (req, res) => {
  res.sendFile(path.join(__dirname, 'config-instance.html'));
});

app.get('/config/:name', (req, res) => {
  res.sendFile(path.join(__dirname, 'config-instance.html'));
});

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
  if (!instanceName || !instances[instanceName]) {
    return res.status(400).json({ error: "Instância inválida" });
  }

  if (botName) instances[instanceName].config.botName = botName;
  instances[instanceName].config.lunchActive = !!lunchActive;
  if (lunchMsg) instances[instanceName].config.lunchMsg = lunchMsg;
  if (menuOptions && Array.isArray(menuOptions)) {
    instances[instanceName].config.menuOptions = menuOptions;
  }

  saveConfigsToDisk();
  console.log(`⚙️ Configurações salvas para a instância: [${instanceName}]`);
  res.json({ success: true, message: "Salvo com sucesso!" });
});

app.post('/api/instances', (req, res) => {
  const { instanceName } = req.body;
  if (!instanceName) return res.status(400).json({ error: "Nome obrigatório" });

  const cleanName = instanceName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (instances[cleanName]) {
    return res.json({ success: true, name: cleanName });
  }

  startBotInstance(cleanName);
  saveConfigsToDisk();
  res.json({ success: true, name: cleanName });
});

app.get('/qr', (req, res) => {
  res.redirect('/qr/principal');
});

app.get('/qr/:name', async (req, res) => {
  const name = req.params.name;
  const inst = instances[name];

  if (!inst) return res.status(404).send("Instância não encontrada.");

  if (inst.status === "Conectado") {
    return res.send(`<html><body style=\"font-family:Arial;text-align:center;padding-top:50px;background:#0f172a;color:white;\"><h1>🎉 WhatsApp (${name}) Conectado!</h1><p><a href=\"/config\" style=\"color:#38bdf8;\">Painel Admin</a></p></body></html>`);
  }

  if (!inst.qr) {
    return res.send(`<html><body style=\"font-family:Arial;text-align:center;padding-top:50px;background:#0f172a;color:white;\"><h1>⏳ Gerando QR Code para (${name})...</h1><script>setTimeout(()=>window.location.reload(),3000);</script></body></html>`);
  }

  try {
    const qrImage = await QRCode.toDataURL(inst.qr);
    res.send(`<html><body style=\"font-family:Arial;text-align:center;padding-top:30px;background:#0f172a;color:white;\"><h1>📱 Conectar WhatsApp: ${name}</h1><img src=\"${qrImage}\" style=\"border-radius:10px;margin-top:20px;border:5px solid white;\"/><p>Status: ${inst.status}</p><p><a href=\"/config\" style=\"color:#38bdf8;\">Painel Admin</a></p><script>setTimeout(()=>window.location.reload(),10000);</script></body></html>`);
  } catch (err) {
    res.status(500).send("Erro ao gerar QR Code.");
  }
});

app.listen(GLOBAL_CONFIG.PORT, '0.0.0.0', () => {
  console.log(`🌐 Servidor "botdosistema" online na porta ${GLOBAL_CONFIG.PORT}`);
  keepAlive();
  
  const savedConfigs = loadConfigsFromDisk();
  if (savedConfigs && Object.keys(savedConfigs).length > 0) {
    Object.keys(savedConfigs).forEach(name => {
      startBotInstance(name, savedConfigs[name]);
    });
  } else {
    startBotInstance('principal');
    saveConfigsToDisk();
  }
});

const userSessions = {};

async function startBotInstance(instanceName, customConfig = null) {
  try {
    console.log(`🔄 Iniciando instância de WhatsApp isolada: [${instanceName}]...`);

    if (!instances[instanceName]) {
      instances[instanceName] = {
        qr: null,
        status: "Iniciando...",
        config: customConfig || JSON.parse(JSON.stringify(defaultInstanceConfig)),
        sock: null
      };
    } else if (customConfig) {
      instances[instanceName].config = customConfig;
    }
    const inst = instances[instanceName];

    if (inst.sock) {
      try {
        inst.sock.end(undefined);
      } catch (e) {}
      inst.sock = null;
    }

    const authPath = path.join(__dirname, `auth_info_${instanceName}`);
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    // Restaura automaticamente credenciais existentes de qualquer pasta de sessão anterior para evitar desconexão
    const legacyAuth = path.join(__dirname, 'auth_info_baileys');
    const targetCreds = path.join(authPath, 'creds.json');
    if (!fs.existsSync(targetCreds)) {
      if (fs.existsSync(path.join(authPath, 'creds.json'))) {
        // ok
      } else if (fs.existsSync(path.join(legacyAuth, 'creds.json'))) {
        try {
          fs.cpSync(legacyAuth, authPath, { recursive: true });
          console.log('🛡️ Sessão anterior restaurada com sucesso!');
        } catch (e) {}
      }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: (instanceName === 'principal'),
      browser: ["Ubuntu", "Chrome", "20.0.0"]
    });

    inst.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        inst.qr = qr;
        inst.status = "Aguardando Leitura";
        console.log(`\n📱 QR Code gerado para [${instanceName}]! Acesse /qr/${instanceName}`);
      }

      if (connection === 'open') {
        inst.status = "Conectado";
        inst.qr = null;
        saveConfigsToDisk();
        console.log(`\n🎉 WhatsApp [${instanceName}] conectado com sucesso!`);
      } else if (connection === 'close') {
        inst.status = "Desconectado";
        inst.sock = null;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          setTimeout(() => startBotInstance(instanceName), 5000);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;
      if (msg.key.remoteJid === 'status@broadcast') return;

      const messageTimestamp = msg.messageTimestamp ? Number(msg.messageTimestamp) * 1000 : Date.now();
      if (Date.now() - messageTimestamp > 30000) return;

      const remoteJid = msg.key.remoteJid;
      if (remoteJid.endsWith('@g.us')) return;

      const messageText = (
        msg.message.conversation || 
        msg.message.extendedTextMessage?.text || 
        msg.message.imageMessage?.caption || ""
      ).trim();

      if (!messageText) return;

      const pushName = msg.pushName || 'Cliente';
      console.log(`\n💬 [${instanceName}] De ${pushName}: "${messageText}"`);

      const sessionKey = `${instanceName}_${remoteJid}`;
      if (!userSessions[sessionKey]) {
        userSessions[sessionKey] = { step: 'MENU_INICIAL', selectedOption: null };
      }

      const session = userSessions[sessionKey];
      const activeConfig = inst.config;

      try {
        await sock.presenceSubscribe(remoteJid);
        await sock.sendPresenceUpdate('composing', remoteJid);

        let replyText = "";
        const exitKeywords = ['menu', '0', 'inicio', 'voltar', 'sair', 'parar', 'cancelar', 'fim', 'terminar'];
        
        if (exitKeywords.includes(messageText.toLowerCase())) {
          session.step = 'MENU_INICIAL';
          session.selectedOption = null;
          replyText = getWelcomeMenuText(pushName, activeConfig);
        }
        else if (session.step === 'MENU_INICIAL') {
          const matchedOption = activeConfig.menuOptions.find(opt => opt.id === messageText);

          if (matchedOption) {
            session.selectedOption = matchedOption;
            
            // Regra de Horário de Almoço (Somente se ativo e for Trabalho)
            const isTrabalho = matchedOption.title.toLowerCase().includes('trabalho');
            if (activeConfig.lunchActive && isTrabalho && isLunchTime) {
              replyText = `${activeConfig.lunchMsg}\n\n*(Digite **menu** para voltar)*`;
            } else {
              session.step = 'AGUARDANDO_DUVIDA';
              replyText = `📁 *Setor: ${matchedOption.title}*\n`;
              replyText += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
              
              if (matchedOption.message) {
                replyText += `${matchedOption.message}\n\n`;
              } else {
                replyText += `Como posso ajudar você neste setor? Por favor, descreva sua dúvida ou solicitação:\n\n`;
              }
              
              if (matchedOption.link) {
                replyText += `🔗 *Link Útil:* ${matchedOption.link}\n\n`;
              }
              
              replyText += `────────────────────────\n*(Digite **menu** para retornar)*`;
            }
          } else {
            replyText = getWelcomeMenuText(pushName, activeConfig);
          }
        } 
        else if (session.step === 'AGUARDANDO_DUVIDA') {
          const opt = session.selectedOption;
          try {
            const contextTitle = opt ? opt.title : 'Geral';
            const aiRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
              model: GLOBAL_CONFIG.AI_MODEL,
              messages: [
                { role: 'system', content: `Você é o assistente de ${activeConfig.botName} no setor "${contextTitle}". Responda de forma profissional, educada e prestativa em português do Brasil.` },
                { role: 'user', content: messageText }
              ],
              temperature: 0.4
            }, {
              headers: { 
                'Authorization': `Bearer ${GLOBAL_CONFIG.AI_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });

            replyText = `${aiRes.data.choices[0].message.content}`;
            replyText += `\n\n────────────────────────\n_💡 Digite sua próxima dúvida ou **menu** para voltar._`;

          } catch (err) {
            console.error('❌ Erro Groq AI:', err.message);
            replyText = `Recebi sua solicitação, mas estou com uma instabilidade momentânea no processamento de IA. Pode repetir, por favor?\n\n*(Ou digite **menu** para voltar)*`;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await sock.sendMessage(remoteJid, { text: replyText });

      } catch (err) {
        console.error(`❌ Erro ao processar mensagem:`, err);
      }
    });

  } catch (err) {
    console.error(`❌ Erro na instância [${instanceName}]:`, err);
    setTimeout(() => startBotInstance(instanceName), 5000);
  }
}
