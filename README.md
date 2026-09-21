# Khrono — site one-page

Versão one-page do site do Khrono, no formato de khrono.tech (herói → segmentos → funcionalidades → por dentro → começar → planos → dúvidas → CTA), com o acabamento do projeto principal: mosaico animado no herói, agenda animada, painel com números vivos, celulares rodando a área do cliente real, tabela de planos com alternância mensal/anual e FAQ animada. PT na raiz, EN em `en/`.

## Como funciona
- `src/page.html` — as seções (tokens `[[t.chave]]`); `src/layout.html` — head, header com âncoras e rodapé; `src/agenda.html` — mockup da agenda; `src/one.css` / `src/one.js` — regras e comportamentos só desta página (scrollspy, agenda, celulares).
- `build.py` — textos PT/EN em `T`; reaproveita do `../base-lean` os assets, o painel (`dash.html`), o bloco de planos (`plans.html`) e as strings comuns. **Precisa da pasta `base-lean` ao lado para gerar.**
- Gerar: `python build.py` → `index.html`, `en/index.html`, `assets/` (versionados, prontos para servir estático).

## Integração
- Formulário "Comece agora" (`form[data-demo="conta"]`, campos `nome`, `negocio`, `email`, `seg`) é interceptado em `assets/js/site.js` (bloco "formulários") — trocar pelo POST real.
- "Entrar" aponta para `https://khrono.tech/workspace` (constante `url_signin` em `build.py`).
- Os celulares carregam `APP` (`build.py`) — hoje a área do cliente publicada em `azeugral.github.io/khrono-front/cliente/`.
