/**
 * conversor_pu.js
 * Converte valores reais (Ohm, W, VAr) para por unidade (p.u.).
 */
import * as mat from './utilitario_mat.js';

export function prepararDados(dados) {
    const { configuracao, nodos, trechos, biblioteca_cabos } = dados;
    const sBase = configuracao.s_base_mva; // MVA
    const vBase = configuracao.v_base_kv;  // kV
    
    // Zbase = (Vbase^2) / Sbase
    const zBase = Math.pow(vBase, 2) / sBase;

    // 1. Processar Nodos (Cargas)
    const nodosPu = nodos.map(n => {
        // Converte W e VAr para p.u. (S_pu = S_real / (Sbase * 10^6))
        // Como sBase está em MVA, dividimos a potência em Watts por 1.000.000
        const p_pu = n.p_w / (sBase * 1000000);
        const q_pu = n.q_var / (sBase * 1000000);
        
        const sPU = mat.criarComplexo(p_pu, q_pu);
        const vInicial = mat.criarComplexoPolar(
            n.tipo === "Slack" ? configuracao.v_subestacao_pu : 1.0, 
            0
        );

        return { ...n, sPU, vAtual: vInicial };
    });

    // 2. Processar Trechos (Impedâncias)
    const trechosPu = trechos.map(t => {
        const cabo = biblioteca_cabos.find(c => c.id === t.cabo);
        if (!cabo) throw new Error(`Cabo '${t.cabo}' não cadastrado na biblioteca.`);

        // Z_pu = (R_total + jX_total) / Zbase
        const rTotal = cabo.r_total_ohm * t.comprimento;
        const xTotal = cabo.x_total_ohm * t.comprimento;
        
        const zOhm = mat.criarComplexo(rTotal, xTotal);
        const zPU = mat.dividir(zOhm, zBase);

        return {
            de: t.de,         // Mantendo o nome original do seu JSON
            para: t.para,     // Mantendo o nome original do seu JSON
            zPU: zPU,
            iCalculada: mat.criarComplexo(0, 0)
        };
    });

    return { configuracao, nodos: nodosPu, trechos: trechosPu };
}
