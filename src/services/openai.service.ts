import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});

export const OpenAIService = {
  async getChatCompletion(userMessage: string, senderName: string = 'Cliente'): Promise<string> {
    try {
      const response = await openaiClient.post('/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente virtual inteligente e prestativo integrado via WhatsApp pela Evolution API. 
Atenda o cliente (${senderName}) de forma cordial, objetiva e profissional em português do Brasil.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply = response.data.choices?.[0]?.message?.content;
      return reply || 'Desculpe, não consegui processar sua resposta no momento.';
    } catch (error: any) {
      console.error('Erro na API da OpenAI:', error.response?.data || error.message);
      return 'Desculpe, ocorreu um erro temporário ao processar sua inteligência artificial.';
    }
  },
};
