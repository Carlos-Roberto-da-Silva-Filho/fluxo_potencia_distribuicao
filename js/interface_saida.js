/**
 * interface_saida.js
 * Exibe os resultados do fluxo de potência com o layout original formatado.
 */
import * as mat from './utilitario_mat.js';

export function exibirResultados(resultados, configuracao) {
    const { nodos, trechos, iteracoes, convergiu, erroFinal } = resultados;
    const { v_base_kv, s_base_mva } = configuracao;

    // Cálculo da Corrente de Base (A) para modelo MONOFÁSICO
    const iBase = (s_base_mva * 1000) / v_base_kv;

    const container = document.getElementById('container-resultados');
    if (!container) return;

    container.innerHTML = '';

    // 1. Resumo do Cálculo
    container.appendChild(criarCabecalho("Resumo do Cálculo"));
    const statusDiv = document.createElement('div');
    statusDiv.className = `alerta ${convergiu ? 'sucesso' : 'erro'}`;
    statusDiv.innerHTML = `
        <p><strong>Status:</strong> ${convergiu ? 'Convergiu' : 'Não Convergiu'}</p>
        <p><strong>Iterações:</strong> ${iteracoes}</p>
        <p><strong>Erro Final:</strong> ${erroFinal.toFixed(6)}</p>
    `;
    container.appendChild(statusDiv);

    // 2. Tabela de Tensões (Visual Original)
    container.appendChild(criarCabecalho("Tensões nas Barras"));
    container.innerHTML += gerarTabelaNodos(nodos, v_base_kv);

    // 3. Tabela de Correntes (Visual Original)
    container.appendChild(criarCabecalho("Fluxo de Corrente nos Trechos"));
    container.innerHTML += gerarTabelaTrechos(trechos, iBase);
}

// Função auxiliar para os títulos
function criarCabecalho(texto) {
    const h3 = document.createElement('h3');
    h3.textContent = texto;
    return h3;
}

// Gera a tabela de nodos com as cores e negritos originais
function gerarTabelaNodos(nodos, vBase) {
    let html = `
        <table class="tabela-resultados">
            <thead>
                <tr>
                    <th>Barra</th>
                    <th>Tensão (p.u.)</th>
                    <th>Tensão (kV)</th>
                    <th>Ângulo (°)</th>
                </tr>
            </thead>
            <tbody>
    `;
    nodos.forEach(n => {
        const vMod = mat.magnitude(n.vAtual);
        const vKV = vMod * vBase;
        html += `
            <tr>
                <td><strong>${n.id}</strong></td>
                <td><strong>${vMod.toFixed(4)}</strong></td>
                <td style="font-weight: 700; color: var(--color-primary-lighter)">${vKV.toFixed(3)} kV</td>
                <td><strong>${mat.anguloGraus(n.vAtual).toFixed(2)}°</strong></td>
            </tr>
        `;
    });
    return html + '</tbody></table>';
}

// Gera a tabela de trechos com as cores e negritos originais
function gerarTabelaTrechos(trechos, iBase) {
    let html = `
        <table class="tabela-resultados">
            <thead>
                <tr>
                    <th>Trecho (De-Para)</th>
                    <th>Corrente (p.u.)</th>
                    <th>Corrente (A)</th>
                    <th>Ângulo (°)</th>
                </tr>
            </thead>
            <tbody>
    `;
    trechos.forEach(t => {
        const iMod = mat.magnitude(t.iCalculada);
        const iAmp = iMod * iBase;
        html += `
            <tr>
                <td><strong>${t.de} → ${t.para}</strong></td>
                <td><strong>${iMod.toFixed(5)}</strong></td>
                <td style="font-weight: 700; color: var(--color-primary-lighter)">${iAmp.toFixed(3)} A</td>
                <td><strong>${mat.anguloGraus(t.iCalculada).toFixed(2)}°</strong></td>
            </tr>
        `;
    });
    return html + '</tbody></table>';
}
