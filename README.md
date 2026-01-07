# Fluxo de Potência em Sistemas de Distribuição (BFS-Web)

Este projeto consiste em uma aplicação web para o cálculo de fluxo de potência em redes de distribuição radiais, utilizando o algoritmo **Backward-Forward Sweep (BFS)**. O objetivo é transformar um modelo matemático testado em Scilab em uma ferramenta interativa, visual e acessível via navegador.

## 1. O Método Backward-Forward Sweep (BFS)

O método BFS é uma técnica iterativa de fluxo de carga especificamente eficiente para sistemas de distribuição. Diferente de sistemas de transmissão, as redes de distribuição são majoritariamente radiais e possuem uma relação $R/X$ elevada, o que pode causar instabilidade em métodos como Newton-Raphson.

### Funcionamento do Algoritmo

O cálculo é dividido em duas etapas principais que se repetem até a convergência:

1.  **Backward Sweep (Varredura de Volta):** Começa nos nós das extremidades (folhas) e caminha em direção à subestação (raiz). Nesta fase, o algoritmo soma as correntes de carga e as correntes dos trechos a jusante.
    -   Equação base: $I_{trecho} = sum I_{cargas_jusante}$
2.  **Forward Sweep (Varredura de Ida):** Começa na subestação (onde a tensão é conhecida) e caminha em direção às extremidades. O algoritmo calcula a queda de tensão em cada trecho para determinar a tensão em cada barra.
    -   Equação base: $V_{filho} = V_{pai} - (Z_{trecho} cdot I_{trecho})$

---

## 2. Operações Matemáticas e Precisão

### Math.js e Números Complexos

O JavaScript não possui suporte nativo para números complexos (onde o "j" representa a unidade imaginária). Para resolver isso, o sistema utiliza a biblioteca **Math.js**.

-   **Manipulação:** Trata números complexos como objetos, permitindo operações como `math.add()`, `math.multiply()`, `math.conj()` e `math.abs()`.
-   **Sintaxe:** Mantém a clareza matemática próxima ao código original em Scilab.

### Padrão IEEE 754

O motor de cálculo utiliza o padrão **IEEE 754** (ponto flutuante de 64 bits) nativo do JavaScript.

-   **Precisão:** Oferece de 15 a 17 dígitos significativos.
-   **Confiabilidade:** Suporta com segurança a configuração de tolerância de até 6 casas decimais ($10^{-6}$), garantindo que os erros de arredondamento da linguagem sejam desprezíveis para cálculos de engenharia.

---

## 3. Estrutura do Arquivo de Dados (JSON)

O sistema utiliza um objeto JSON para armazenar a topologia e as premissas de cálculo. A seção de configuração é definida da seguinte forma:

```javascript
"configuracao": {    "titulo": "Sistema de Distribuição 10 Barras - Estudo Inicial",    "v_base_kv": 13.8,           // Tensão nominal para cálculo de Zbase    "s_base_mva": 0.1,           // Potência aparente base    "v_subestacao_pu": 1.0,      // Tensão de partida definida pelo usuário    "tolerancia": 0.001,         // Critério de parada (delta V)    "max_iteracoes": 100,        // Limite de segurança contra divergência    "casas_decimais_exibicao": 3 // Formatação para exibição de resultados}
```

## 4. Topologia e Mapeamento da Árvore

Para que o sistema aceite qualquer desenho de rede de forma dinâmica, são implementadas duas lógicas:

### Lista de Adjacência Reversa

Mapeamos cada barra ao seu antecessor imediato (Pai). Como o sistema é estritamente radial, cada nó (exceto a subestação) possui apenas um pai, facilitando a "subida" da árvore no Backward Sweep.

### Lógica dos Níveis (Layering)

As barras são organizadas em camadas de profundidade:

-   Nível 0: Subestação (Raiz).
    
-   Nível 1: Barras conectadas diretamente à subestação.
    
-   Nível 2: Barras conectadas ao Nível 1, e assim por diante.
    

### Por que isso é necessário?

Ordenação: Garante que o Backward Sweep processe todos os "filhos" antes de processar os "pais".

Eficiência: No Forward Sweep, garante que a tensão do "pai" já esteja calculada antes de tentar determinar a tensão do "filho".