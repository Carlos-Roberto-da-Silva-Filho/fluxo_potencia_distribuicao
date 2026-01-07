/**
 * navegacao.js
 * Gerencia a troca de telas (views) sem recarregar a página.
 */

export function configurarNavegacao() {
    window.navegar = (idView) => {
        // 1. Esconder todas as views
        const views = document.querySelectorAll('.view');
        views.forEach(v => {
            v.classList.remove('active');
        });

        // 2. Mostrar a view desejada
        const viewAlvo = document.getElementById(`view-${idView}`);
        if (viewAlvo) {
            viewAlvo.classList.add('active');
        }

        // 3. Atualizar botões do menu
        const botoes = document.querySelectorAll('.menu-item');
        botoes.forEach(btn => {
            btn.classList.remove('active');
            // Verifica se o clique corresponde à view
            if (btn.getAttribute('onclick').includes(`'${idView}'`)) {
                btn.classList.add('active');
            }
        });

        console.log(`Navegação: exibindo ${idView}`);
    };
}
