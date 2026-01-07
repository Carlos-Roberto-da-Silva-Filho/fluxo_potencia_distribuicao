const STORAGE_KEY = 'powerflow_projeto';

const projetoPadrao = {
    configuracao: { titulo: "Novo Projeto", v_base_kv: 13.8, s_base_mva: 100, v_subestacao_pu: 1.0, tolerancia: 0.001, max_iteracoes: 100 },
    biblioteca_cabos: [],
    nodos: [{ id: "1", tipo: "Slack", p_w: 0, q_var: 0 }],
    trechos: []
};

export function obterProjeto() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : projetoPadrao;
}

export function salvarProjeto(projeto) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projeto));
}

export function carregarConfiguracaoParaUI() {
    const projeto = obterProjeto();
    const cfg = projeto.configuracao;
    if (!document.getElementById('cfg-titulo')) return;
    document.getElementById('cfg-titulo').value = cfg.titulo || "";
    document.getElementById('cfg-vbase').value = cfg.v_base_kv;
    document.getElementById('cfg-sbase').value = cfg.s_base_mva;
    document.getElementById('cfg-vslack').value = cfg.v_subestacao_pu;
    document.getElementById('cfg-tol').value = cfg.tolerancia;
}

export function salvarConfiguracaoUI() {
    const projeto = obterProjeto();
    projeto.configuracao = {
        titulo: document.getElementById('cfg-titulo').value,
        v_base_kv: parseFloat(document.getElementById('cfg-vbase').value),
        s_base_mva: parseFloat(document.getElementById('cfg-sbase').value),
        v_subestacao_pu: parseFloat(document.getElementById('cfg-vslack').value),
        tolerancia: parseFloat(document.getElementById('cfg-tol').value),
        max_iteracoes: 100
    };
    salvarProjeto(projeto);
    alert("Configurações salvas!");
}

export function renderizarTabelaCabos() {
    const projeto = obterProjeto();
    const corpo = document.getElementById('tabela-cabos-body');
    if (!corpo) return;
    corpo.innerHTML = projeto.biblioteca_cabos.map((c, i) => `
        <tr>
            <td><strong>${c.id}</strong></td>
            <td>${c.r_total_ohm}</td>
            <td>${c.x_total_ohm}</td>
            <td style="text-align:center"><button class="btn-icon" onclick="removerCabo(${i})"><span class="material-symbols-outlined" style="color:#ef4444">delete</span></button></td>
        </tr>
    `).join('');
    atualizarSelectsTrechos();
}

export function adicionarCaboUI() {
    const id = document.getElementById('cabo-id').value.trim();
    const r = parseFloat(document.getElementById('cabo-r').value);
    const x = parseFloat(document.getElementById('cabo-x').value);
    if (!id || isNaN(r)) return alert("Dados inválidos.");
    const projeto = obterProjeto();
    projeto.biblioteca_cabos.push({ id, r_total_ohm: r, x_total_ohm: x });
    salvarProjeto(projeto);
    renderizarTabelaCabos();
}

export function renderizarTabelaNodos() {
    const projeto = obterProjeto();
    const corpo = document.getElementById('tabela-nodos-body');
    if (!corpo) return;
    corpo.innerHTML = projeto.nodos.map((n, i) => `
        <tr>
            <td><strong>${n.id}</strong></td>
            <td><span class="tag">${n.tipo}</span></td>
            <td>${n.p_w}</td>
            <td>${n.q_var}</td>
            <td style="text-align:center"><button class="btn-icon" onclick="removerNodo(${i})"><span class="material-symbols-outlined" style="color:#ef4444">delete</span></button></td>
        </tr>
    `).join('');
    atualizarSelectsTrechos();
}

export function adicionarNodoUI() {
    const id = document.getElementById('nodo-id').value.trim();
    const p = parseFloat(document.getElementById('nodo-p').value);
    const q = parseFloat(document.getElementById('nodo-q').value);
    if (!id || isNaN(p)) return alert("Dados inválidos.");
    const projeto = obterProjeto();
    projeto.nodos.push({ id, tipo: document.getElementById('nodo-tipo').value, p_w: p, q_var: q });
    salvarProjeto(projeto);
    renderizarTabelaNodos();
}

export function atualizarSelectsTrechos() {
    const projeto = obterProjeto();
    const selDe = document.getElementById('trecho-de');
    const selPara = document.getElementById('trecho-para');
    const selCabo = document.getElementById('trecho-cabo');
    if (!selDe || !selPara || !selCabo) return;
    const optNodos = projeto.nodos.map(n => `<option value="${n.id}">${n.id}</option>`).join('');
    const optCabos = projeto.biblioteca_cabos.map(c => `<option value="${c.id}">${c.id}</option>`).join('');
    selDe.innerHTML = optNodos;
    selPara.innerHTML = optNodos;
    selCabo.innerHTML = optCabos;
}

export function renderizarTabelaTrechos() {
    const projeto = obterProjeto();
    const corpo = document.getElementById('tabela-trechos-body');
    if (!corpo) return;
    corpo.innerHTML = projeto.trechos.map((t, i) => `
        <tr>
            <td>${t.de}</td>
            <td>${t.para}</td>
            <td>${t.cabo}</td>
            <td>${t.comprimento} km</td>
            <td style="text-align:center"><button class="btn-icon" onclick="removerTrecho(${i})"><span class="material-symbols-outlined" style="color:#ef4444">delete</span></button></td>
        </tr>
    `).join('');
}

export function adicionarTrechoUI() {
    const de = document.getElementById('trecho-de').value;
    const para = document.getElementById('trecho-para').value;
    const cabo = document.getElementById('trecho-cabo').value;
    const km = parseFloat(document.getElementById('trecho-km').value);
    if (!cabo || isNaN(km)) return alert("Verifique os dados do trecho.");
    const projeto = obterProjeto();
    projeto.trechos.push({ de, para, cabo, comprimento: km });
    salvarProjeto(projeto);
    renderizarTabelaTrechos();
}

export function removerCaboUI(i) { const p = obterProjeto(); p.biblioteca_cabos.splice(i,1); salvarProjeto(p); renderizarTabelaCabos(); }
export function removerNodoUI(i) { const p = obterProjeto(); p.nodos.splice(i,1); salvarProjeto(p); renderizarTabelaNodos(); }
export function removerTrechoUI(i) { const p = obterProjeto(); p.trechos.splice(i,1); salvarProjeto(p); renderizarTabelaTrechos(); }

