import { configurarNavegacao } from './navegacao.js';
import { mapearNiveis } from './mapeador_rede.js';
import { prepararDados } from './conversor_pu.js';
import { executarFluxo } from './motor_bfs.js';
import { exibirResultados } from './interface_saida.js';
import * as db from './gerenciador_dados.js';

document.addEventListener('DOMContentLoaded', () => {
    configurarNavegacao();
    db.carregarConfiguracaoParaUI();
    db.renderizarTabelaCabos();
    db.renderizarTabelaNodos();
    db.renderizarTabelaTrechos();
});

window.salvarConfiguracao = () => db.salvarConfiguracaoUI();
window.adicionarCabo = () => db.adicionarCaboUI();
window.removerCabo = (i) => db.removerCaboUI(i);
window.adicionarNodo = () => db.adicionarNodoUI();
window.removerNodo = (i) => db.removerNodoUI(i);
window.adicionarTrecho = () => db.adicionarTrechoUI();
window.removerTrecho = (i) => db.removerTrechoUI(i);

window.rodarSimulacao = async () => {
    const container = document.getElementById('container-resultados');
    window.navegar('resultados');
    try {
        const dadosProjeto = db.obterProjeto();
        if (dadosProjeto.trechos.length === 0) throw new Error("A rede não possui trechos conectados.");
        const topologia = mapearNiveis(dadosProjeto);
        const dadosPu = prepararDados(dadosProjeto);
        const resultados = executarFluxo(dadosPu, topologia);
        exibirResultados(resultados, dadosProjeto.configuracao);
    } catch (e) {
        if (container) container.innerHTML = `<div class="card"><h3>Erro no Processamento</h3><p>${e.message}</p></div>`;
    }
};

window.exportarProjeto = () => {
    const dados = db.obterProjeto();
    
    // --- LÓGICA DE PRECISÃO E FORMATAÇÃO DO JSON ---
    
    // 1. Identifica a precisão com base na tolerância (ex: 0.001 -> 3 casas)
    const tol = dados.configuracao.tolerancia || 0.0001;
    const casasDecimais = tol.toString().includes('.') ? tol.toString().split('.')[1].length : 2;

    // 2. Cria uma cópia profunda para manipulação sem alterar o estado atual do app
    const dadosParaExportar = JSON.parse(JSON.stringify(dados));

    // 3. Adiciona a chave solicitada no objeto de configuração
    dadosParaExportar.configuracao.casas_decimais_exibicao = casasDecimais;

    // 4. Função recursiva para garantir que todos os números sigam a precisão da tolerância
    const aplicarArredondamento = (obj) => {
        for (let chave in obj) {
            if (typeof obj[chave] === 'number') {
                // Converte para o número de casas decimais e volta para tipo Number
                obj[chave] = Number(obj[chave].toFixed(casasDecimais));
            } else if (typeof obj[chave] === 'object' && obj[chave] !== null) {
                aplicarArredondamento(obj[chave]);
            }
        }
        return obj;
    };

    // 5. Executa o arredondamento em todo o objeto (nodos, trechos, biblioteca)
    const dadosFinalizados = aplicarArredondamento(dadosParaExportar);
    
    // 6. Gera o arquivo JSON formatado para download
    const conteudoJson = JSON.stringify(dadosFinalizados, null, 2);
    const blob = new Blob([conteudoJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `projeto_sistema_${Date.now()}.json`;
    
    // Executa o clique e remove o elemento
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoga a URL para liberar recursos do navegador
    URL.revokeObjectURL(url);
};

window.importarProjeto = (event) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const projeto = JSON.parse(e.target.result);
            db.salvarProjeto(projeto);
            location.reload();
        } catch (err) { alert("Arquivo JSON inválido."); }
    };
    reader.readAsText(event.target.files[0]);
};
