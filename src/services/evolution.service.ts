import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || '';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const INSTANCE_NAME = process.env.INSTANCE_NAME || '';

const client = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY,
  },
});

export const EvolutionService = {
  async sendText(remoteJid: string, text: string, instanceName: string = INSTANCE_NAME): Promise<any> {
    try {
      const response = await client.post(`/message/sendText/${instanceName}`, {
        number: remoteJid.replace('@s.whatsapp.net', ''),
        textMessage: {
          text,
        },
        options: {
          delay: 1200,
          presence: 'composing',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem via Evolution API:', error.response?.data || error.message);
      throw error;
    }
  },

  async sendPresence(remoteJid: string, presence: 'composing' | 'recording' | 'available', instanceName: string = INSTANCE_NAME): Promise<any> {
    try {
      const response = await client.post(`/chat/sendPresence/${instanceName}`, {
        number: remoteJid.replace('@s.whatsapp.net', ''),
        presence,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao enviar presença via Evolution API:', error.response?.data || error.message);
    }
  },
};
