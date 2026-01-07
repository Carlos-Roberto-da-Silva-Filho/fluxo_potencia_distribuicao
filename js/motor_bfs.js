/**
 * motor_bfs.js
 * Algoritmo de fluxo de potência Backward-Forward Sweep (BFS).
 */

import * as mat from './utilitario_mat.js';

export function executarFluxo(dadosPu, topologia) {
    const { nodos, trechos, configuracao } = dadosPu;
    const { mapa, niveis } = topologia;
    const { tolerancia, max_iteracoes } = configuracao;

    if (!niveis) throw new Error("Topologia inválida: níveis não mapeados.");

    let erro = 1.0;
    let iteracao = 0;
    let convergiu = false;

    while (erro > tolerancia && iteracao < max_iteracoes) {
        iteracao++;
        let erroMaximoNestaIteracao = 0;

        // --- 1. BACKWARD SWEEP (Correntes) ---
        const ordemBackward = [...niveis].reverse();
        for (const nivel of ordemBackward) {
            for (const idNodo of nivel) {
                const nodo = nodos.find(n => n.id === idNodo);
                if (nodo.tipo === "Slack") continue;

                // I_carga = conj(S_pu / V_atual)
                const iCarga = mat.conjugado(mat.dividir(nodo.sPU, nodo.vAtual));

                // Soma correntes dos filhos
                const filhosIds = mapa[idNodo].filhos;
                const correntesFilhos = filhosIds.map(idFilho => {
                    const t = trechos.find(tr => 
                        (tr.de === idNodo && tr.para === idFilho) || 
                        (tr.para === idNodo && tr.de === idFilho)
                    );
                    return t ? t.iCalculada : mat.criarComplexo(0, 0);
                });

                const iTotal = mat.somar([iCarga, ...correntesFilhos]);

                // Salva no trecho que liga ao pai
                const idPai = mapa[idNodo].pai;
                const trechoM = trechos.find(tr => 
                    (tr.de === idNodo && tr.para === idPai) || 
                    (tr.para === idNodo && tr.de === idPai)
                );
                if (trechoM) trechoM.iCalculada = iTotal;
            }
        }

        // --- 2. FORWARD SWEEP (Tensões) ---
        for (const nivel of niveis) {
            for (const idNodo of nivel) {
                const idPai = mapa[idNodo].pai;
                if (idPai !== null) {
                    const nodo = nodos.find(n => n.id === idNodo);
                    const pai = nodos.find(n => n.id === idPai);
                    
                    // Busca o trecho conectando filho e pai
                    const trecho = trechos.find(tr => 
                        (tr.de === idNodo && tr.para === idPai) || 
                        (tr.para === idNodo && tr.de === idPai)
                    );

                    if (!trecho) {
                        throw new Error(`Conexão não encontrada entre ${idPai} e ${idNodo}`);
                    }

                    // V_filho = V_pai - (Z_pu * I_calc)
                    const queda = mat.multiplicar(trecho.zPU, trecho.iCalculada);
                    const vNova = mat.subtrair(pai.vAtual, queda);

                    const diff = Math.abs(mat.magnitude(vNova) - mat.magnitude(nodo.vAtual));
                    if (diff > erroMaximoNestaIteracao) erroMaximoNestaIteracao = diff;

                    nodo.vAtual = vNova;
                }
            }
        }

        erro = erroMaximoNestaIteracao;
        if (erro <= tolerancia) convergiu = true;
    }

    return { nodos, trechos, iteracoes: iteracao, convergiu, erroFinal: erro };
}
