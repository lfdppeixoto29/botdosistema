#!/bin/bash

echo "=========================================="
echo "   INSTALAÇÃO AUTOMÁTICA - BOT DOSISTEMA"
echo "=========================================="

# Atualiza o sistema
echo "🔄 Atualizando pacotes do sistema..."
sudo apt update && sudo apt upgrade -y

# Instala Node.js 20 se não estiver instalado
if ! command -v node &> /dev/null
then
    echo "📦 Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "✅ Node.js instalado: $(node -v)"

# Instala PM2 globalmente para gerenciar o processo 24/7
if ! command -v pm2 &> /dev/null
then
    echo "⚙️ Instalando PM2..."
    sudo npm install -g pm2
fi

# Instala dependências do projeto
echo "📦 Instalando dependências do projeto..."
npm install

# Inicia o bot com PM2
echo "🚀 Iniciando o Bot do Sistema com PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "=========================================="
echo "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "👉 Acesse http://SEU_IP_DA_VPS:3001/qr para escanear o QR Code."
echo "=========================================="
