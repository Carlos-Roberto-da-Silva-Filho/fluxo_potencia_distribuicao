/**
 * utilitario_mat.js
 * Centraliza as operações matemáticas complexas utilizando a biblioteca math.js.
 * Este módulo prepara o ambiente para cálculos de fasores (tensão, corrente e potência).
 */

// A math.js já trabalha com precisão de 64 bits (IEEE 754) por padrão.
const m = math;

/**
 * Cria um número complexo a partir da parte real e imaginária (R + jX).
 */
export function criarComplexo(real, imag) {
    return m.complex(real, imag);
}

/**
 * Cria um número complexo a partir da forma polar (magnitude e ângulo em graus).
 */
export function criarComplexoPolar(magnitude, anguloGraus) {
    const anguloRad = m.unit(anguloGraus, 'deg').toNumber('rad');
    return m.complex({ r: magnitude, phi: anguloRad });
}

// --- OPERAÇÕES BÁSICAS ---

/**
 * Realiza a soma de dois números complexos ou de uma lista de complexos.
 * @param {Object|Array} a - Um número complexo ou um Array de complexos.
 * @param {Object} [b] - O segundo número complexo (opcional se 'a' for array).
 */
export function somar(a, b) {
    if (Array.isArray(a)) {
        if (a.length === 0) return m.complex(0, 0);
        return a.reduce((acumulador, atual) => m.add(acumulador, atual));
    }
    return m.add(a, b);
}

/**
 * Realiza a subtração entre dois números complexos (a - b).
 */
export function subtrair(a, b) {
    return m.subtract(a, b);
}

/**
 * Realiza a multiplicação entre dois números complexos (a * b).
 */
export function multiplicar(a, b) {
    return m.multiply(a, b);
}

/**
 * Realiza a divisão entre dois números complexos (a / b).
 */
export function dividir(a, b) {
    return m.divide(a, b);
}

// --- FUNÇÕES ACESSÓRIAS ---

/**
 * Retorna o conjugado de um número complexo.
 * Essencial para I = (S / V)*
 */
export function conjugado(c) {
    return m.conj(c);
}

/**
 * Calcula a magnitude (módulo) de um número complexo.
 */
export function magnitude(c) {
    return m.abs(c);
}

/**
 * Calcula o ângulo de um número complexo em graus.
 */
export function anguloGraus(c) {
    const anguloRad = m.arg(c);
    return anguloRad * (180 / Math.PI);
}

/**
 * Formata um número complexo para exibição (Magnitude ∠Ângulo°).
 * @param {Object} c - O número complexo.
 * @param {number} casas - Número de casas decimais (padrão: 3).
 */
export function formatarComplexo(c, casas = 3) {
    const mag = magnitude(c).toFixed(casas);
    const ang = anguloGraus(c).toFixed(casas);
    return `${mag} ∠${ang}°`;
}
