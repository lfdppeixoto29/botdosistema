# 📄 Documentação Oficial - Bot do Sistema (Luiz Fernando)

Este documento contém todas as informações técnicas, credenciais, tokens, links de acesso e regras atualizadas de funcionamento do **Bot do Sistema**.

---

## 1. 🌐 Endereços e Sites Utilizados
- **Página Principal (Login Admin)**: `https://botdosistema-luiz.onrender.com/`
- **Painel Geral de Celulares (Multi-Zaps)**: `https://botdosistema-luiz.onrender.com/config`
- **Página de Configuração por Celular**: `https://botdosistema-luiz.onrender.com/config/nome_da_instancia`
- **Página de QR Code Principal**: `https://botdosistema-luiz.onrender.com/qr`
- **Painel Cloudflare**: `https://dash.cloudflare.com`
- **Painel Render (Servidor em Nuvem)**: `https://dash.render.com`
- **Repositório GitHub**: `https://github.com/lfdppeixoto29/botdosistema`

---

## 2. 🔐 Credenciais de Acesso (Logins e Senhas)
- **Painel Admin do Bot**:
  - **Usuário**: `admin`
  - **Senha**: `luiz29`
- **Conta Cloudflare (Dashboard & API)**:
  - **Token Cloudflare**: `e37acc29e506ac92089430e678235767`
- **Conta Render (Servidor 24h)**:
  - **Chave de API (Render Token)**: `rnd_Y8lFiBkqCfNAU4HGi80pCWeO7Yfu`
  - **E-mail da Conta**: `lfdppeixoto29@gmail.com` (Equipe: projeto social pilot)

---

## 3. 🤖 Inteligência Artificial & APIs
- **Provedor de IA**: Groq (100% Gratuito e Ultra-rápido)
- **Chave de API Groq (AI_API_KEY)**: `gsk_***************************************************` (Configurada via variável de ambiente no Render)
- **Modelo de IA Utilizado**: `qwen/qwen3.8-27b`

---

## 4. 📱 Gerenciamento de Múltiplos WhatsApps (Multi-Zaps) & Páginas Individuais
O sistema suporta conexões independentes para vários números de WhatsApp simultaneamente com uma interface totalmente reorganizada:
- **Painel em Grade (`/config`)**: Exibe cards em tempo real com o status de cada celular (`Conectado`, `Aguardando Leitura`, `Desconectado`).
- **Páginas Individuais (`/config/:name`)**: Cada número possui sua própria página de configuração isolada, onde você define o nome do atendente, horário de almoço e as opções do menu numérico sem confusão.
- **Suporte a Logotipo Corporativo**: O bot exibe o menu inicial estruturado em caixa corporativa e suporta envio opcional de logotipo (`logo.png`).

---

## 5. ⏰ Regras de Negócio e Horário de Almoço
- **Menu Numérico**: O cliente interage digitando números (1, 2, 3...) configurados no painel.
- **Controle de Almoço Ativo/Inativo**: No painel de cada celular, é possível marcar/desmarcar se o horário de almoço (12h às 13h) está ativo ou inativo. Quando ativo, mensagens para o setor de Trabalho recebem o aviso personalizado de almoço.
- **Atendimento por IA**: Fora do horário de almoço ou com o almoço desativado, a inteligência artificial conduz o suporte profissionalmente em nome do atendente configurado.

---
*Documentação oficial atualizada para Luiz Fernando &bull; Bot do Sistema*
