/**
 * =====================================================================
 * BOT DOSISTEMA - CLOUDFLARE WORKER / CLOUDFLARE TUNNEL READY
 * =====================================================================
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Rota Web / Status do Bot
    if (url.pathname === '/' || url.pathname === '/botdosistema') {
      const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bot do Sistema - Luiz Fernando</title>
            <style>
                body { font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 50px; }
                .container { background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0px 4px 20px rgba(0,0,0,0.3); display: inline-block; max-width: 500px; }
                h1 { color: #38bdf8; }
                .status { font-weight: bold; color: #4ade80; }
                p { color: #94a3b8; line-height: 1.6; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 Bot do Sistema</h1>
                <h3>Assistente Virtual de Luiz Fernando</h3>
                <p>Status na Nuvem Cloudflare: <span class="status">🟢 Online e Operacional</span></p>
                <p>Sistema otimizado para alta performance, segurança e disponibilidade na rede global da Cloudflare.</p>
            </div>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // Rota de Webhook / API
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const body = await request.json();
        console.log('[Cloudflare Worker] Webhook recebido:', body);
        return new Response(JSON.stringify({ status: 'success', message: 'Webhook processado na Cloudflare' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
