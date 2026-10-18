import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { EvolutionService } from './services/evolution.service';
import { OpenAIService } from './services/openai.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'online', service: 'Evolution AI Middleware' });
});

// Webhook endpoint for Evolution API
app.post('/webhook/evolution', async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    
    // Log do evento recebido
    console.log(`[Webhook] Evento recebido: ${eventData.event} para instância ${eventData.instance}`);

    // Verificamos se é um evento de mensagem upsert (nova mensagem)
    if (eventData.event === 'messages.upsert') {
      const data = eventData.data;
      
      // Ignorar mensagens enviadas por nós mesmos (fromMe)
      if (data.key?.fromMe) {
        return res.status(200).json({ status: 'ignored', reason: 'message from me' });
      }

      // Ignorar mensagens de grupos (opcional, aqui focamos em chat privado)
      if (data.key?.remoteJid?.endsWith('@g.us')) {
        return res.status(200).json({ status: 'ignored', reason: 'group message' });
      }

      const remoteJid = data.key?.remoteJid;
      const pushName = data.pushName || 'Cliente';
      
      // Extrair texto da mensagem (suporta conversation ou extendedTextMessage)
      const messageText = 
        data.message?.conversation || 
        data.message?.extendedTextMessage?.text || 
        data.message?.imageMessage?.caption;

      if (!remoteJid || !messageText) {
        return res.status(200).json({ status: 'ignored', reason: 'no text content or remoteJid' });
      }

      console.log(`[Mensagem] De: ${pushName} (${remoteJid}) -> Texto: "${messageText}"`);

      // Enviar status de "digitando..."
      await EvolutionService.sendPresence(remoteJid, 'composing', eventData.instance);

      // Obter resposta inteligente da OpenAI
      const aiResponse = await OpenAIService.getChatCompletion(messageText, pushName);

      // Enviar resposta de volta pelo WhatsApp via Evolution API
      await EvolutionService.sendText(remoteJid, aiResponse, eventData.instance);

      console.log(`[Resposta] Enviada para ${remoteJid}: "${aiResponse}"`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.error('[Erro Webhook]', error.message || error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Evolution AI Middleware rodando na porta ${PORT}`);
  console.log(`📌 Webhook endpoint pronto em: http://localhost:${PORT}/webhook/evolution`);
});
