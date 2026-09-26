# Relatórios mensais — formatação dos arquivos

Pacote de formatação para o back-end gerar os relatórios e enviá-los por e-mail. Dois arquivos:

- **`relatorio.html`** — molde único do documento (vira PDF). Os nove relatórios usam este mesmo esqueleto; muda o título, as colunas e os grupos.
- **`email.html`** — corpo do e-mail que leva o PDF em anexo e o link.

Os modelos renderizados com dados de exemplo estão em <https://azeugral.github.io/khrono-one/relatorios/> (é a mesma formatação, em tela).

## Regras de formatação

| Item | Regra |
|---|---|
| Página | A4 retrato, margem 12 mm, fonte base 10 pt |
| Moeda | `1.234,56` sem o símbolo dentro da tabela (o rodapé diz "valores em reais"); com `R$` nas caixas de destaque e no e-mail |
| Data | `dd/mm` dentro da tabela, `dd/mm/aaaa` no cabeçalho, `dd/mm/aaaa hh:mm` na emissão |
| Percentual | uma casa decimal, vírgula (`38,2%`) |
| Números | alinhados à direita, tabulares; texto à esquerda; valor zerado vira `—` |
| Grupos | faixa cinza com código + nome; **subtotal** ao fim de cada grupo; linha em branco entre grupos |
| Total geral | última linha, fundo preto, texto branco |
| Quebra de página | nunca no meio de uma linha, de um subtotal ou de um grupo; cabeçalho da tabela repete em toda página (`thead` como `table-header-group`) |
| Vazio | quando não houver movimento, imprimir o cabeçalho normalmente e uma linha única "Nenhum registro no período" |

## Tokens do molde

**Fixos em todos:** `empresa.razaoSocial`, `empresa.nome`, `empresa.cnpj`, `empresa.endereco`, `periodo.competencia` (ex.: "setembro de 2026"), `periodo.inicio`, `periodo.fim`, `emissao.dataHora`, `relatorio.titulo`, `relatorio.filtros` (linha de status/filtros aplicados).

**Estrutura da tabela:** `colunas[] {titulo, alinhamento}` (`alinhamento` = vazio ou `num`), `grupos[] {grupo.codigoRotulo, grupo.nome, grupo.linhas[].celulas[] {valor, alinhamento}, grupo.subtotal {rotulo, colspan, valores[]}}`, `total {rotulo, colspan, valores[]}`.

**Opcionais:** `resumo.itens[] {rotulo, valor}` (caixas no topo), `observacao` (texto explicativo ao pé), `assinaturas.itens[]` (linhas de assinatura).

## Os nove relatórios

| Arquivo | Título | Agrupado por | Colunas | Subtotal | Extras |
|---|---|---|---|---|---|
| `faturamento-profissional` | Faturamento por profissional | profissional | Data, Nº, Cliente, Serviço, Pagamento, Valor, Desc., Acrésc., Total | por profissional (qtd. + ticket médio) | — |
| `comissoes` | Comissões a pagar | — | Cód., Profissional, Atend., Faturamento, Descontos, Base, %, Comissão, A pagar | — | observação + 2 assinaturas |
| `recebimentos` | Recebimentos por forma de pagamento | — | Forma, Qtd., Bruto, Taxa, Líquido, Participação | — | observação |
| `caixa-diario` | Caixa diário | — | Data, Dia, Atend., uma coluna por forma, Total do dia | — | 2 assinaturas |
| `servicos` | Serviços realizados | — | Serviço, Qtd., Preço de tabela, Ticket médio, Faturamento, Participação | — | — |
| `clientes` | Clientes e retorno | — | Cliente, Atendimentos, Ticket médio, Total | subtotal dos 10 maiores | resumo (4 caixas) + observação |
| `faltas` | Faltas e cancelamentos | — | Data, Nº, Cliente, Serviço, Profissional, Situação, Valor | — | resumo (4 caixas) + observação |
| `assinaturas` | Assinaturas e pacotes | — | Plano, Ativos, Valor unitário, Receita recorrente, Sessões usadas, A usar | — | observação |
| `resumo-mes` | Resumo do mês | Receita / Custos e despesas | Descrição, Valor | por bloco | resumo (4 caixas) + observação + 2 assinaturas |

## Arquivos gerados e envio

- **Nome do arquivo:** `khrono_<relatorio>_<unidade-slug>_<aaaa-mm>.pdf` — ex.: `khrono_comissoes_studio-aurora-pinheiros_2026-09.pdf`. O CSV usa a mesma regra com `.csv`, separador `;` e BOM UTF-8 (abre no Excel em português).
- **Assunto do e-mail:** `Khrono · <título> — <competência> — <unidade>`.
- **Remetente:** `relatorios@khrono.tech`, nome "Khrono"; `Reply-To: contato@khrono.tech`.
- **Envio:** todo dia 1º, às 8h (fuso do negócio), com o fechamento do mês anterior; o proprietário escolhe em Configurações → Relatórios quais relatórios recebe e quais e-mails entram na lista.
- **Link:** além do anexo, um link assinado que expira (`relatorio.diasLink`, sugestão 30 dias) para quem quiser abrir no navegador ou baixar de novo.
- **Anexos:** PDF sempre; CSV quando o relatório tiver tabela (todos, menos o Resumo do mês). Se o PDF passar de 8 MB, enviar só o link.
- **LGPD:** o e-mail vai apenas para responsáveis da conta; o rodapé precisa dizer por que a pessoa está recebendo e como desligar o envio.
