# Khrono — site one-page

Versão one-page do site do Khrono, no formato de khrono.tech (herói → segmentos → funcionalidades → por dentro → começar → planos → dúvidas → CTA), com o acabamento do projeto principal: mosaico animado no herói, agenda animada, painel com números vivos, celulares rodando a área do cliente real, tabela de planos com alternância mensal/anual e FAQ animada. PT na raiz, EN em `en/`.

## Como funciona
- `src/page.html` — as seções (tokens `[[t.chave]]`); `src/layout.html` — head, header com âncoras e rodapé; `src/agenda.html` — mockup da agenda; `src/one.css` / `src/one.js` — regras e comportamentos só desta página (scrollspy, agenda, celulares).
- `build.py` — textos PT/EN em `T`; reaproveita do `../base-lean` os assets, o painel (`dash.html`), o bloco de planos (`plans.html`) e as strings comuns. **Precisa da pasta `base-lean` ao lado para gerar.**
- Gerar: `python build.py` → `index.html`, `en/index.html`, `assets/` (versionados, prontos para servir estático).

## Painel do negócio
Mora em repositório próprio: <https://github.com/azeugral/khrono-painel> · no ar em <https://azeugral.github.io/khrono-painel/>.

<!-- histórico da versão que ficava aqui -->
### Widgets e dados (referência)
Protótipo do painel do proprietário (`src/painel/`), pensado para o back-end implementar. Widgets e o dado que cada um precisa:

| Widget | Dado |
|---|---|
| Faturamento · Agendamentos · Ocupação · Ticket médio | soma por período + período anterior; ocupação = horas atendidas ÷ horas disponíveis da equipe |
| Movimento no período | série diária (faturamento e agendamentos), com a série do período anterior |
| Hoje na agenda | agendamentos do dia com status (confirmado/aguardando) e buracos livres |
| Horários de pico | matriz dia da semana × faixa de horário |
| Formas de pagamento | total por forma |
| Equipe | faturamento, nº de atendimentos, comissão e ocupação por profissional |
| Serviços mais vendidos | quantidade × preço por serviço |
| Clientes | novos × recorrentes no período |
| Faltas e cancelamentos | contagem + receita perdida + taxa de confirmação |
| Hora de voltar | clientes que passaram do ciclo do serviço e não remarcaram |
| Meta do mês | meta configurada × realizado |

Filtros: unidade, período (hoje/7/30/365) e profissional, mais a personalização dos blocos. Tema claro é o padrão.

## Relatórios do mês (`relatorios/`)
Nove modelos de relatório prontos para impressão/PDF (A4), no formato que o contador e o proprietário esperam: cabeçalho com razão social, CNPJ, unidade, competência e data de emissão; agrupamento; subtotais por grupo; total geral; rodapé; campos de assinatura onde faz sentido.

`profissional` (faturamento por profissional, item a item) · `comissoes` (base, % e valor a pagar) · `recebimentos` (por forma, com taxa e líquido) · `caixa` (entradas por dia e forma) · `servicos` (quantidade, ticket e participação) · `clientes` (novos, retorno e 10 maiores) · `faltas` (horários perdidos e receita não realizada) · `assinaturas` (recorrência e sessões a usar) · `resumo` (receita − comissões − taxas − fixos = resultado).

Filtros: competência (12 meses) e unidade. Botões: **Imprimir / PDF** (usa o diálogo do navegador, CSS `@page A4`) e **CSV** da tabela em tela. Link direto por relatório: `relatorios/#comissoes`. Dados fictícios em `src/relatorios/app.js` (função `gerar`) — trocar por dados da API mantém o layout.

**Formatação para o back-end** (PDF + e-mail): `src/relatorios/modelos/` — `relatorio.html` (molde único com tokens), `email.html` (corpo do e-mail com anexo e link) e `README.md` (regras de formatação, tokens, nomes de arquivo, assunto e regras de envio). Publicado em `relatorios/modelos/`.

## Integração
- Formulário "Comece agora" (`form[data-demo="conta"]`, campos `nome`, `negocio`, `email`, `seg`) é interceptado em `assets/js/site.js` (bloco "formulários") — trocar pelo POST real.
- "Entrar" aponta para `https://khrono.tech/workspace` (constante `url_signin` em `build.py`).
- Os celulares carregam `APP` (`build.py`) — hoje a área do cliente publicada em `azeugral.github.io/khrono-front/cliente/`.
