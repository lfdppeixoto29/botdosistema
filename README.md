# Evolution Bot (Simples) 🚀

Este sistema foi simplificado para **apenas 1 arquivo** (`server.js`).

## Como usar:

1. Abra o arquivo **`server.js`** em qualquer editor (como Bloco de Notas ou VS Code).
2. Cole suas chaves e URLs nas linhas iniciais (objeto `CONFIG`):
   - `EVOLUTION_API_URL`
   - `EVOLUTION_API_KEY`
   - `INSTANCE_NAME`
   - `OPENAI_API_KEY`
3. Instale as dependências uma única vez abrindo o terminal na pasta e digitando:
   ```bash
   npm install
   ```
4. Inicie o bot:
   ```bash
   npm start
   ```
5. Configure o webhook na sua Evolution API para apontar para:
   `http://seu-ip-ou-ngrok:3000/webhook` (evento `MESSAGES_UPSERT`).
