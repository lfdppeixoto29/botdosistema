# Guia de Deploy em VPS (Servidor Dedicado na Nuvem) 🚀

Para rodar o **Bot do Sistema** de **Luiz Fernando** 24 horas por dia, sem quedas e sem depender do seu computador, siga os passos abaixo em qualquer VPS Linux (Ubuntu 20.04+):

## Passo 1: Contrate uma VPS
Você pode usar qualquer VPS barata (Hetzner, DigitalOcean, HostGator, Contabo ou Oracle Cloud Free Tier). 
Recomendamos Ubuntu 20.04 ou 22.04 LTS.

## Passo 2: Acesse sua VPS via SSH
Abra o terminal do seu computador e conecte-se à sua VPS:
```bash
ssh root@SEU_IP_DA_VPS
```

## Passo 3: Envie os arquivos do projeto
Envie a pasta `G:\evolution bot` para a sua VPS (via Git, SCP ou FileZilla) em `/root/botdosistema`.

## Passo 4: Execute o instalador automático
Entre na pasta do projeto na VPS e rode o script de instalação que criamos para você:
```bash
cd /root/botdosistema
chmod +x deploy-vps.sh
./deploy-vps.sh
```

O script vai instalar automaticamente:
- Node.js 20
- PM2 (Gerenciador de processos 24/7)
- Dependências do projeto

## Passo 5: Conecte o WhatsApp
Abra no seu navegador:
👉 `http://SEU_IP_DA_VPS:3001/qr`

Escaneie o QR Code com o celular do Luiz Fernando e pronto! O bot estará rodando na nuvem 24 horas por dia, com persistência de sessão e zero erros.
