/**
 * mapeador_rede.js
 * Transforma a lista de trechos em uma estrutura de árvore (niveis e mapa pai-filho).
 */
export function mapearNiveis(dadosProjeto) {
    const { nodos, trechos } = dadosProjeto;
    
    // 1. Localiza a barra de referência (Slack)
    const slack = nodos.find(n => n.tipo === "Slack");
    if (!slack) throw new Error("Defina uma barra como 'Slack' na Aba 3.");

    // 2. Inicializa o mapa de conectividade
    // O motor BFS precisa saber quem é o pai e quem são os filhos de cada barra
    const mapa = {};
    nodos.forEach(n => {
        mapa[n.id] = { pai: null, filhos: [] };
    });

    const niveis = [[slack.id]];
    const visitados = new Set([slack.id]);
    let nivelAtual = 0;

    // 3. Algoritmo de busca em largura para montar os níveis e o mapa
    while (true) {
        const nodosNivelAcima = niveis[nivelAtual];
        const proximoNivel = [];

        nodosNivelAcima.forEach(paiId => {
            // Busca conexões onde a barra atual (paiId) está envolvida
            trechos.forEach(t => {
                let filhoId = null;
                if (t.de === paiId && !visitados.has(t.para)) filhoId = t.para;
                else if (t.para === paiId && !visitados.has(t.de)) filhoId = t.de;

                if (filhoId) {
                    visitados.add(filhoId);
                    proximoNivel.push(filhoId);
                    
                    // Registra a hierarquia no mapa
                    mapa[filhoId].pai = paiId;
                    mapa[paiId].filhos.push(filhoId);
                }
            });
        });

        if (proximoNivel.length === 0) break;
        niveis.push(proximoNivel);
        nivelAtual++;
        
        if (nivelAtual > 500) break; // Segurança contra loops infinitos
    }

    // 4. Verificação de integridade
    if (visitados.size < nodos.length) {
        throw new Error("Existem barras isoladas na rede. Verifique se todos os trechos estão conectados à Slack.");
    }

    // Retorna o objeto completo que o motor_bfs.js espera
    return { mapa, niveis };
}
