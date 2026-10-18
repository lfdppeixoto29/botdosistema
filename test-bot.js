const axios = require('axios');

async function testarBot() {
  console.log("🧪 [TESTE] Simulando uma mensagem de WhatsApp para o bot local...");
  console.log("--------------------------------------------------");
  
  const payload = {
    event: "messages.upsert",
    instance: "minha-instancia",
    data: {
      key: {
        remoteJid: "5511999999999@s.whatsapp.net",
        fromMe: false
      },
      pushName: "João Silva",
      message: {
        conversation: "Olá! Qual é o preço dos seus serviços?"
      }
    }
  };

  try {
    const response = await axios.post('http://localhost:3001/webhook', payload);
    console.log("✅ Webhook processado com sucesso!");
    console.log("📦 Retorno:", response.data);
  } catch (error) {
    console.error("❌ Erro ao testar o bot:", error.response?.data || error.message);
  }
}

testarBot();
