<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel de Controle - Bot do Sistema</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: #0f172a; color: #f8fafc; height: 100vh; display: flex; overflow: hidden; }
        
        /* Menu Lateral Esquerdo */
        .sidebar { width: 380px; background: #1e293b; border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; padding: 20px; z-index: 10; }
        .main-content { flex: 1; background: #0f172a; overflow-y: auto; padding: 40px; display: flex; justify-content: center; align-items: flex-start; }

        .logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .logo-area span { font-size: 28px; }
        .logo-area h2 { color: #38bdf8; font-size: 18px; }

        .menu-list { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; margin-bottom: 20px; }
        
        .menu-group { background: #0f172a; border: 1px solid #334155; border-radius: 10px; overflow: hidden; margin-bottom: 8px; }
        .menu-group.active { border-color: #38bdf8; background: rgba(56, 189, 248, 0.03); }
        
        .menu-header { padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 14px; font-weight: 600; color: #f1f5f9; background: #162032; }
        .menu-header:hover { background: #1e293b; }
        
        .submenu { display: flex; flex-direction: column; padding: 5px; background: #0f172a; }
        
        .sub-btn { background: transparent; border: none; color: #94a3b8; padding: 9px 15px; border-radius: 6px; font-size: 13px; text-align: left; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-weight: 500; }
        .sub-btn:hover { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
        .sub-btn.active { background: #38bdf8; color: #0f172a; font-weight: 600; }

        .sub-submenu { display: flex; flex-direction: column; padding-left: 12px; margin-top: 4px; gap: 4px; }
        
        .option-branch { background: rgba(255,255,255,0.02); border: 1px solid #334155; border-radius: 6px; padding: 8px; margin-bottom: 4px; }
        .option-branch-title { font-size: 12px; font-weight: 600; color: #38bdf8; display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 4px; }
        
        .sub-sub-btn { background: rgba(255,255,255,0.03); border: 1px solid #334155; color: #cbd5e1; padding: 6px 10px; border-radius: 4px; font-size: 11px; text-align: left; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 2px; }
        .sub-sub-btn:hover { background: #38bdf8; color: #0f172a; border-color: #38bdf8; font-weight: 600; }
        .sub-sub-btn.active { background: #38bdf8; color: #0f172a; border-color: #38bdf8; font-weight: 600; }

        .btn-add { background: #25d366; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; width: 100%; transition: background 0.3s; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .btn-add:hover { background: #20ba5a; }

        .sidebar-footer { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; text-align: center; }
        .sidebar-footer a { color: #94a3b8; font-size: 13px; text-decoration: none; }
        .sidebar-footer a:hover { color: #38bdf8; }

        /* Centro: Exibe as configurações da seção selecionada */
        .container { width: 100%; max-width: 750px; background: #1e293b; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
        h1 { color: #38bdf8; margin-bottom: 5px; font-size: 22px; display: flex; align-items: center; justify-content: space-between; }
        p.subtitle { color: #94a3b8; margin-bottom: 25px; font-size: 14px; }
        .section { background: rgba(15, 23, 42, 0.6); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .section h3 { color: #f1f5f9; margin-bottom: 15px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-size: 13px; color: #cbd5e1; margin-bottom: 5px; font-weight: 600; }
        input, textarea { width: 100%; padding: 10px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: white; font-size: 14px; }
        textarea { resize: vertical; height: 90px; }
        input:focus, textarea:focus { outline: none; border-color: #38bdf8; }
        .btn { background: #25d366; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.3s; width: 100%; font-size: 15px; }
        .btn:hover { background: #20ba5a; }
        .btn-secondary { background: #38bdf8; color: #0f172a; }
        .btn-secondary:hover { background: #0ea5e9; color: white; }
        .success-msg { background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 12px; border-radius: 8px; margin-bottom: 20px; display: none; text-align: center; border: 1px solid rgba(34, 197, 94, 0.4); font-weight: 600; font-size: 15px; }
        .option-card { background: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #334155; }
        .badge { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
        .badge.Conectado { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
        .badge.Desconectado { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
        .badge.Aguardando { background: rgba(250, 204, 21, 0.2); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.4); }
        .placeholder-center { text-align: center; color: #64748b; padding: 60px 20px; font-size: 16px; }
        .sub-req-card { background: #0f172a; padding: 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #334155; display: flex; gap: 10px; align-items: center; }
    </style>
</head>
<body>

    <div class="sidebar">
        <div>
            <div class="logo-area">
                <span>🤖</span>
                <h2>Bot do Sistema</h2>
            </div>
            
            <button class="btn" onclick="salvarTudo()" style="background: #25d366; color: white; margin-bottom: 8px; font-size: 14px; padding: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);">
                💾 Salvar Tudo Agora
            </button>

            <button class="btn" onclick="sairDoPainel()" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 8px; font-size: 13px; padding: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: none;">
                🚪 Sair do Painel Admin
            </button>

            <button class="btn-add" onclick="criarNovoZap()" style="margin-bottom: 15px; font-size: 13px; padding: 10px;">+ Adicionar Novo Celular</button>

            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">Selecione uma opção no menu:</p>
            
            <div class="menu-list" id="menuInstancesList">
                <!-- Preenchido via JS -->
            </div>
        </div>

        <div>
            <!-- Rodapé da sidebar limpo -->
        </div>
    </div>

    <div class="main-content">
        <div id="centerArea" style="width: 100%; display: flex; justify-content: center;">
            <div class="placeholder-center">
                <h2>👈 Selecione um item no menu à esquerda</h2>
            </div>
        </div>
    </div>

    <script>
        let currentInstance = '';
        let currentSection = 'geral'; 
        let allData = { instancesConfigs: {}, statuses: {} };
        let showSavedAlert = false;

        function carregarDados() {
            fetch('/api/admin/data')
                .then(res => res.json())
                .then(data => {
                    allData = data;
                    const keys = Object.keys(data.instancesConfigs);
                    if (keys.length === 0) return;

                    if (!currentInstance || !data.instancesConfigs[currentInstance]) {
                        currentInstance = keys[0];
                    }

                    renderizarMenuLateral();
                    renderizarCentro();
                });
        }

        function renderizarMenuLateral() {
            const list = document.getElementById('menuInstancesList');
            if (!list) return;

            let html = '';

            Object.keys(allData.instancesConfigs).forEach(name => {
                const status = allData.statuses[name] || 'Desconectado';
                let iconStatus = '🔴';
                if (status === 'Conectado') iconStatus = '🟢';
                else if (status.includes('Aguardando')) iconStatus = '🟡';

                const isActiveInstance = (name === currentInstance);
                const cfg = allData.instancesConfigs[name];
                const menuOpts = cfg.menuOptions || [];

                let subMenuOptionsHtml = '';
                menuOpts.forEach((opt, idx) => {
                    const isSubChoiceActive = isActiveInstance && currentSection === `sub_${idx}`;
                    
                    if (!opt.subRequests) opt.subRequests = [];

                    let subReqHtml = '';
                    opt.subRequests.forEach((req, reqIdx) => {
                        const isReqActive = isActiveInstance && currentSection === `req_${idx}_${reqIdx}`;
                        subReqHtml += `
                            <button class="sub-sub-btn ${isReqActive ? 'active' : ''}" onclick="mudarSecao('${name}', 'req_${idx}_${reqIdx}')">
                                🔸 ${req.title || 'Solicitação'}
                            </button>
                        `;
                    });

                    subMenuOptionsHtml += `
                        <div class="option-branch">
                            <div class="option-branch-title" onclick="mudarSecao('${name}', 'opt_${idx}')">
                                <span>🔹 [${opt.id}] ${opt.title || 'Sem Título'}</span>
                                <span>⚙️</span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 3px; margin-top: 4px;">
                                <button class="sub-sub-btn ${isSubChoiceActive ? 'active' : ''}" onclick="mudarSecao('${name}', 'sub_${idx}')">
                                    📂 Tipos de Solicitações (${opt.subRequests.length})
                                </button>
                                ${subReqHtml}
                            </div>
                        </div>
                    `;
                });

                html += `
                    <div class="menu-group ${isActiveInstance ? 'active' : ''}">
                        <div class="menu-header" onclick="mudarInstancia('${name}')">
                            <span>📱 ${name.toUpperCase()} ${iconStatus}</span>
                            <span>${isActiveInstance ? '▲' : '▼'}</span>
                        </div>
                        <div class="submenu" style="display: ${isActiveInstance ? 'flex' : 'none'};">
                            <button class="sub-btn ${isActiveInstance && currentSection === 'geral' ? 'active' : ''}" onclick="mudarSecao('${name}', 'geral')">⚙️ Configurações Gerais</button>
                            <button class="sub-btn ${isActiveInstance && currentSection === 'almoco' ? 'active' : ''}" onclick="mudarSecao('${name}', 'almoco')">🍽️ Horário de Almoço</button>
                            
                            <div>
                                <button class="sub-btn ${isActiveInstance && currentSection === 'menu' ? 'active' : ''}" onclick="mudarSecao('${name}', 'menu')">
                                    📑 Opções de Menu (1,2,3) ▾
                                </button>
                                <div class="sub-submenu">
                                    ${subMenuOptionsHtml}
                                    <button class="sub-sub-btn" style="color: #4ade80; text-align:center; margin-top:6px; justify-content:center;" onclick="adicionarOpcaoMenu()">+ Adicionar Opção Principal</button>
                                </div>
                            </div>

                            <button class="sub-btn" style="color: #4ade80;" onclick="window.open('/qr/${name}', '_blank')">📷 Ver QR Code</button>
                        </div>
                    </div>
                `;
            });

            list.innerHTML = html;
        }

        function mudarInstancia(name) {
            coletarDadosTela();
            currentInstance = name;
            currentSection = 'geral';
            renderizarMenuLateral();
            renderizarCentro();
        }

        function mudarSecao(name, secao) {
            coletarDadosTela();
            currentInstance = name;
            currentSection = secao;
            renderizarMenuLateral();
            renderizarCentro();
        }

        function renderizarCentro() {
            const cfg = allData.instancesConfigs[currentInstance];
            const status = allData.statuses[currentInstance] || 'Desconectado';
            if (!cfg) return;

            if (!cfg.menuOptions) cfg.menuOptions = [];
            const currentOptions = cfg.menuOptions;
            const centerArea = document.getElementById('centerArea');
            
            let titleSec = currentSection.toUpperCase();
            if (currentSection.startsWith('opt_')) {
                const idx = parseInt(currentSection.split('_')[1]);
                const opt = currentOptions[idx];
                titleSec = `OPÇÃO [${opt ? opt.id : idx}] - ${opt ? opt.title : ''}`;
            } else if (currentSection.startsWith('sub_')) {
                const idx = parseInt(currentSection.split('_')[1]);
                const opt = currentOptions[idx];
                titleSec = `TIPOS DE SOLICITAÇÕES &bull; ${opt ? opt.title : ''}`;
            }

            let htmlContent = `
                <div class="container">
                    <h1>
                        <span>⚙️ ${currentInstance.toUpperCase()}</span>
                        <span class="badge ${status.includes('Conectado') ? 'Conectado' : (status.includes('Aguardando') ? 'Aguardando' : 'Desconectado')}">${status}</span>
                    </h1>

                    <div id="successAlert" class="success-msg" style="display: ${showSavedAlert ? 'block' : 'none'};">✅ Configurações salvas com sucesso!</div>
            `;

            if (showSavedAlert) {
                setTimeout(() => {
                    showSavedAlert = false;
                    const el = document.getElementById('successAlert');
                    if (el) el.style.display = 'none';
                }, 5000);
            }

            if (currentSection === 'geral') {
                htmlContent += `
                    <div class="section">
                        <h3>💬 Configurações Gerais</h3>
                        <div class="form-group">
                            <label>Nome do Atendente para este Número</label>
                            <input type="text" id="inputBotName" value="${cfg.botName || 'Luiz Fernando'}">
                        </div>
                    </div>
                `;
            } else if (currentSection === 'almoco') {
                htmlContent += `
                    <div class="section">
                        <h3>🍽️ Horário de Almoço (12h às 13h)</h3>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <input type="checkbox" id="inputLunchActive" ${cfg.lunchActive !== false ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #38bdf8; cursor: pointer;">
                            <label for="inputLunchActive" style="margin-bottom: 0; cursor: pointer; color: #f1f5f9;">Ativar Mensagem de Horário de Almoço</label>
                        </div>
                        <div class="form-group">
                            <label>Mensagem de Almoço</label>
                            <textarea id="inputLunchMsg">${cfg.lunchMsg || ''}</textarea>
                        </div>
                    </div>
                `;
            } else if (currentSection === 'menu') {
                htmlContent += `
                    <div class="section">
                        <h3>📑 Opções do Menu (1, 2, 3...)</h3>
                        <div id="optionsContainer"></div>
                        <button class="btn btn-secondary" onclick="adicionarOpcao()" style="margin-top: 10px;">+ Adicionar Nova Opção</button>
                    </div>
                `;
            } else if (currentSection.startsWith('opt_')) {
                const idx = parseInt(currentSection.split('_')[1]);
                const opt = currentOptions[idx] || { id: '', title: '', link: '' };
                htmlContent += `
                    <div class="section">
                        <h3>📑 Editar Opção Principal</h3>
                        <div class="form-group">
                            <label>Número da Opção (Ex: 1, 2, 3...)</label>
                            <input type="text" id="inputOptId" value="${opt.id}">
                        </div>
                        <div class="form-group">
                            <label>Título da Opção (Ex: Trabalho, Particular)</label>
                            <input type="text" id="inputOptTitle" value="${opt.title}">
                        </div>
                        <div class="form-group">
                            <label>Link Opcional de Redirecionamento</label>
                            <input type="url" id="inputOptLink" value="${opt.link || ''}" placeholder="https://...">
                        </div>
                        <button class="btn" style="background: #ef4444; padding: 8px; font-size: 13px;" onclick="removerOpcaoIndividual(${idx})">Remover esta Opção</button>
                    </div>
                `;
            } else if (currentSection.startsWith('sub_')) {
                const idx = parseInt(currentSection.split('_')[1]);
                const opt = currentOptions[idx];
                if (!opt.subRequests) opt.subRequests = [];

                let subReqsHtml = '';
                opt.subRequests.forEach((req, reqIdx) => {
                    subReqsHtml += `
                        <div class="sub-req-card">
                            <input type="text" class="sub-req-input" data-opt="${idx}" data-req="${reqIdx}" value="${req.title}" placeholder="Nome da Solicitação" style="flex:1;">
                            <button class="btn" style="background: #ef4444; padding: 8px; width: auto;" onclick="removerSubReq(${idx}, ${reqIdx})">X</button>
                        </div>
                    `;
                });

                htmlContent += `
                    <div class="section">
                        <h3>📂 Tipos de Solicitações para: <span style="color:#38bdf8;">${opt.title}</span></h3>
                        <div id="subReqsContainer">
                            ${subReqsHtml}
                        </div>
                        <button class="btn btn-secondary" onclick="adicionarSubReq(${idx})" style="margin-top: 10px;">+ Adicionar Tipo de Solicitação</button>
                    </div>
                `;
            }

            htmlContent += `
                    <button class="btn" onclick="salvarTudo()" style="margin-top: 20px;">💾 Salvar Configurações</button>
                </div>
            `;

            centerArea.innerHTML = htmlContent;

            if (currentSection === 'menu') {
                renderizarOpcoesEmLote();
            }
        }

        function renderizarOpcoesEmLote() {
            const container = document.getElementById('optionsContainer');
            if (!container) return;
            const cfg = allData.instancesConfigs[currentInstance];
            const opts = cfg.menuOptions || [];
            container.innerHTML = '';
            opts.forEach((opt, index) => {
                container.innerHTML += `
                    <div class="option-card" data-index="${index}">
                        <div class="form-group">
                            <label>Número da Opção (1, 2, 3...)</label>
                            <input type="text" class="batch-opt-id" value="${opt.id}">
                        </div>
                        <div class="form-group">
                            <label>Título da Opção</label>
                            <input type="text" class="batch-opt-title" value="${opt.title}">
                        </div>
                        <div class="form-group">
                            <label>Link Opcional</label>
                            <input type="url" class="batch-opt-link" value="${opt.link || ''}" placeholder="https://...">
                        </div>
                        <button class="btn" style="background: #ef4444; padding: 6px; font-size: 13px;" onclick="removerOpcao(${index})">Remover Opção</button>
                    </div>
                `;
            });
        }

        function coletarDadosTela() {
            const cfg = allData.instancesConfigs[currentInstance];
            if (!cfg) return;

            // Gerais
            const botNameInput = document.getElementById('inputBotName');
            if (botNameInput) cfg.botName = botNameInput.value;

            const lunchActiveInput = document.getElementById('inputLunchActive');
            if (lunchActiveInput) cfg.lunchActive = lunchActiveInput.checked;

            const lunchMsgInput = document.getElementById('inputLunchMsg');
            if (lunchMsgInput) cfg.lunchMsg = lunchMsgInput.value;

            // Seção Menu (lote)
            if (currentSection === 'menu') {
                const cards = document.querySelectorAll('.option-card');
                const novasOpcoes = [];
                cards.forEach(card => {
                    const id = card.querySelector('.batch-opt-id').value;
                    const title = card.querySelector('.batch-opt-title').value;
                    const link = card.querySelector('.batch-opt-link').value;
                    const idx = card.getAttribute('data-index');
                    const subRequests = cfg.menuOptions[idx] ? cfg.menuOptions[idx].subRequests || [] : [];
                    novasOpcoes.push({ id, title, link, subRequests });
                });
                cfg.menuOptions = novasOpcoes;
            }

            // Seção Opt individual
            if (currentSection.startsWith('opt_')) {
                const idx = parseInt(currentSection.split('_')[1]);
                if (cfg.menuOptions[idx]) {
                    const idInput = document.getElementById('inputOptId');
                    const titleInput = document.getElementById('inputOptTitle');
                    const linkInput = document.getElementById('inputOptLink');
                    if (idInput) cfg.menuOptions[idx].id = idInput.value;
                    if (titleInput) cfg.menuOptions[idx].title = titleInput.value;
                    if (linkInput) cfg.menuOptions[idx].link = linkInput.value;
                }
            }

            // Seção Sub (Tipos de solicitações)
            if (currentSection.startsWith('sub_')) {
                const idx = parseInt(currentSection.split('_')[1]);
                if (cfg.menuOptions[idx]) {
                    if (!cfg.menuOptions[idx].subRequests) cfg.menuOptions[idx].subRequests = [];
                    const inputs = document.querySelectorAll('.sub-req-input');
                    inputs.forEach(input => {
                        const rIdx = parseInt(input.getAttribute('data-req'));
                        if (cfg.menuOptions[idx].subRequests[rIdx]) {
                            cfg.menuOptions[idx].subRequests[rIdx].title = input.value;
                        }
                    });
                }
            }
        }

        function salvarTudo() {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];

            const payload = {
                instanceName: currentInstance,
                botName: cfg.botName,
                lunchActive: cfg.lunchActive,
                lunchMsg: cfg.lunchMsg,
                menuOptions: cfg.menuOptions
            };

            return fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(response => {
                showSavedAlert = true;
                renderizarCentro();
                renderizarMenuLateral();
                return response;
            });
        }

        function sairDoPainel() {
            coletarDadosTela();
            salvarTudo().finally(() => {
                window.location.href = '/';
            });
        }

        function adicionarOpcao() {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            if (!cfg.menuOptions) cfg.menuOptions = [];
            const novoId = (cfg.menuOptions.length + 1).toString();
            cfg.menuOptions.push({ id: novoId, title: "Nova Opção", link: "", subRequests: [] });
            renderizarCentro();
        }

        function adicionarOpcaoMenu() {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            if (!cfg.menuOptions) cfg.menuOptions = [];
            const novoId = (cfg.menuOptions.length + 1).toString();
            cfg.menuOptions.push({ id: novoId, title: "Nova Opção", link: "", subRequests: [] });
            renderizarMenuLateral();
            renderizarCentro();
        }

        function removerOpcao(index) {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            cfg.menuOptions.splice(index, 1);
            renderizarCentro();
        }

        function removerOpcaoIndividual(index) {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            cfg.menuOptions.splice(index, 1);
            currentSection = 'menu';
            salvarTudo();
        }

        function adicionarSubReq(optIndex) {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            if (!cfg.menuOptions[optIndex].subRequests) cfg.menuOptions[optIndex].subRequests = [];
            cfg.menuOptions[optIndex].subRequests.push({ title: "Nova Solicitação" });
            renderizarCentro();
        }

        function removerSubReq(optIndex, reqIndex) {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            cfg.menuOptions[optIndex].subRequests.splice(reqIndex, 1);
            renderizarCentro();
        }

        function criarNovoZap() {
            const name = prompt('Digite o nome ou apelido para o novo celular (ex: vendas, suporte2):');
            if (!name) return;
            const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

            fetch('/api/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instanceName: cleanName })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    carregarDados();
                } else {
                    alert('Erro ao criar instância.');
                }
            });
        }

        carregarDados();

        // Auto-save ao sair da página (fecha, navega para outra, recarrega)
        window.addEventListener('beforeunload', function(e) {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            if (cfg) {
                const payload = {
                    instanceName: currentInstance,
                    botName: cfg.botName,
                    lunchActive: cfg.lunchActive,
                    lunchMsg: cfg.lunchMsg,
                    menuOptions: cfg.menuOptions
                };
                // sendBeacon garante envio mesmo ao fechar a aba/navegador
                navigator.sendBeacon('/api/admin/config', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
            }
        });

        // Auto-save periódico a cada 30 segundos
        setInterval(function() {
            coletarDadosTela();
            const cfg = allData.instancesConfigs[currentInstance];
            if (cfg) {
                const payload = {
                    instanceName: currentInstance,
                    botName: cfg.botName,
                    lunchActive: cfg.lunchActive,
                    lunchMsg: cfg.lunchMsg,
                    menuOptions: cfg.menuOptions
                };
                fetch('/api/admin/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(() => {});
            }
        }, 30000);

        // Atualizar status de conexão a cada 10 segundos (sem perder dados editados)
        setInterval(function() {
            fetch('/api/admin/data')
                .then(res => res.json())
                .then(data => {
                    // Atualizar APENAS os statuses, sem sobrescrever configs da tela
                    Object.keys(data.statuses).forEach(name => {
                        allData.statuses[name] = data.statuses[name];
                    });
                    renderizarMenuLateral();
                    const badge = document.querySelector('.badge');
                    if (badge && allData.statuses[currentInstance]) {
                        const st = allData.statuses[currentInstance];
                        badge.textContent = st;
                        badge.className = 'badge ' + (st.includes('Conectado') ? 'Conectado' : (st.includes('Aguardando') ? 'Aguardando' : 'Desconectado'));
                    }
                }).catch(() => {});
        }, 10000);
    </script>
</body>
</html>

<!-- updated 1792329021236 -->