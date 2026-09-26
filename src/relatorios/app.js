/* Relatórios mensais do Khrono — modelos genéricos para barbearias, salões e clínicas.
   Dados fictícios determinísticos: trocar gerar() por dados da API mantém o layout. */
(function(){
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const EMP = { nome:'Studio Aurora — Pinheiros', razao:'Studio Aurora Serviços de Beleza LTDA', cnpj:'12.345.678/0001-90', end:'R. dos Pinheiros, 1240 — Pinheiros, São Paulo/SP' };
  const PROS = [ {id:'01', n:'Ana Ribeiro', c:.40}, {id:'02', n:'Bruno Costa', c:.40}, {id:'03', n:'Camila Duarte', c:.35}, {id:'04', n:'Diego Martins', c:.45} ];
  const SVC = [ {n:'Corte feminino', p:80}, {n:'Escova modelada', p:60}, {n:'Coloração', p:180}, {n:'Limpeza de pele', p:150}, {n:'Design de sobrancelhas', p:45}, {n:'Corte masculino', p:55}, {n:'Hidratação', p:95}, {n:'Manicure', p:40} ];
  const FORMAS = [ {n:'Pix', p:.38, tx:0}, {n:'Cartão de crédito', p:.29, tx:.0349}, {n:'Cartão de débito', p:.16, tx:.0189}, {n:'Dinheiro', p:.11, tx:0}, {n:'Pacote / assinatura', p:.06, tx:0} ];
  const NOMES = ['Júlia Prado','Marcos Lima','Rita Alves','Sofia Neves','Paulo Dias','Helena Gil','Tiago Moura','Bianca Faria','Renato Sá','Clara Pinto','Vitor Rocha','Lúcia Mendes','Igor Teixeira','Nina Barros','Otávio Ramos'];
  const rnd = s => { let h = 2166136261; for(const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 1e4) / 1e4; };
  const brl = v => v.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const pct = v => (v * 100).toLocaleString('pt-BR', { minimumFractionDigits:1, maximumFractionDigits:1 }) + '%';
  const d2 = n => String(n).padStart(2,'0');
  const MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

  /* ---------- dados do mês ---------- */
  let ref = new Date(); ref.setDate(1);
  function gerar(base){
    const y = base.getFullYear(), m = base.getMonth(), dias = new Date(y, m+1, 0).getDate(), hoje = new Date();
    const fim = (y === hoje.getFullYear() && m === hoje.getMonth()) ? hoje.getDate() : dias;
    const its = []; let seq = 1000 + m * 137;
    for(let d = 1; d <= fim; d++){
      const dt = new Date(y, m, d), w = dt.getDay(); if(w === 0) continue;
      const qtd = Math.round((w === 6 ? 14 : w === 5 ? 13 : 10) * (0.7 + rnd(`${y}${m}${d}`) * 0.6));
      for(let i = 0; i < qtd; i++){
        const r = rnd(`${d}-${i}-${m}`), s = SVC[Math.floor(rnd('s'+d+i) * SVC.length)], p = PROS[Math.floor(rnd('p'+d+i) * PROS.length)];
        const desc = r > .88 ? Math.round(s.p * .1 * 100) / 100 : 0, acr = r < .04 ? 15 : 0;
        const st = r > .95 ? 'falta' : r > .92 ? 'cancelado' : 'concluido';
        const forma = (()=>{ let a = rnd('f'+d+i), t = 0; for(const f of FORMAS){ t += f.p; if(a <= t) return f; } return FORMAS[0]; })();
        its.push({ id: ++seq, d: dt, cli: NOMES[Math.floor(rnd('c'+d+i) * NOMES.length)], svc:s.n, bruto:s.p, desc, acr, tot: s.p - desc + acr, pro:p, forma, st, novo: rnd('n'+d+i) > .77 });
      }
    }
    return { y, m, dias, fim, its };
  }
  const ok = D => D.its.filter(i => i.st === 'concluido');
  const soma = (a, k) => a.reduce((s, x) => s + (typeof k === 'function' ? k(x) : x[k]), 0);

  /* ---------- moldura do relatório ---------- */
  const periodo = D => `01/${d2(D.m+1)}/${D.y} a ${d2(D.fim)}/${d2(D.m+1)}/${D.y}`;
  const emitido = ()=> new Date().toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' });
  function folha(D, titulo, sub, corpo, rodape){
    return `<div class="sheet">
      <div class="rh">
        <div class="emp"><b>${EMP.razao}</b>${EMP.nome} · CNPJ ${EMP.cnpj}<br>${EMP.end}</div>
        <div class="mid">Emitido em ${emitido()}<br>khrono.tech</div>
        <div class="rt">Competência<br><b>${MES[D.m]} de ${D.y}</b></div>
      </div>
      <h1 class="rtitle">${titulo}</h1>
      <p class="rsub">Período: <b>${periodo(D)}</b> · Unidade: <b>${EMP.nome}</b> · ${sub}</p>
      ${corpo}
      <div class="rf"><span>${rodape || 'Documento gerado pelo Khrono · valores em reais (R$)'}</span><span>Página 1</span></div>
    </div>`;
  }
  const linhaTot = (cols, label, vals) => `<tr class="tot"><td colspan="${cols}">${label}</td>${vals.map(v=>`<td class="num">${v}</td>`).join('')}</tr>`;

  /* ---------- relatórios ---------- */
  const R = {};
  R.profissional = D => {
    const its = ok(D); let corpo = '<table><thead><tr><th>Data</th><th>Nº</th><th>Cliente</th><th>Serviço</th><th>Pagamento</th><th class="num">Valor</th><th class="num">Desc.</th><th class="num">Acrésc.</th><th class="num">Total</th></tr></thead><tbody>';
    let gB = 0, gD = 0, gA = 0, gT = 0, gQ = 0;
    PROS.forEach(p=>{
      const l = its.filter(i => i.pro.id === p.id); if(!l.length) return;
      const b = soma(l,'bruto'), ds = soma(l,'desc'), ac = soma(l,'acr'), t = soma(l,'tot');
      gB += b; gD += ds; gA += ac; gT += t; gQ += l.length;
      corpo += `<tr class="grp"><td colspan="9"><span class="gid">Profissional ${p.id}</span>${p.n}</td></tr>`;
      corpo += l.map(i=>`<tr><td class="num" style="text-align:left">${d2(i.d.getDate())}/${d2(D.m+1)}</td><td class="num" style="text-align:left">${i.id}</td><td>${i.cli}</td><td>${i.svc}</td><td>${i.forma.n}</td><td class="num">${brl(i.bruto)}</td><td class="num">${i.desc ? brl(i.desc) : '—'}</td><td class="num">${i.acr ? brl(i.acr) : '—'}</td><td class="num">${brl(i.tot)}</td></tr>`).join('');
      corpo += `<tr class="sum"><td colspan="5">Total do profissional · ${l.length} atendimentos · ticket médio ${brl(t / l.length)}</td><td class="num">${brl(b)}</td><td class="num">${brl(ds)}</td><td class="num">${brl(ac)}</td><td class="num">${brl(t)}</td></tr><tr class="sp"><td colspan="9"></td></tr>`;
    });
    corpo += linhaTot(5, `Total geral · ${gQ} atendimentos concluídos`, [brl(gB), brl(gD), brl(gA), brl(gT)]) + '</tbody></table>';
    return folha(D, 'Faturamento por profissional', 'Status: somente atendimentos concluídos e pagos', corpo);
  };
  R.comissoes = D => {
    const its = ok(D);
    let corpo = '<table><thead><tr><th>Cód.</th><th>Profissional</th><th class="num">Atend.</th><th class="num">Faturamento</th><th class="num">Descontos</th><th class="num">Base</th><th class="num">%</th><th class="num">Comissão</th><th class="num">A pagar</th></tr></thead><tbody>';
    let gq = 0, gf = 0, gb = 0, gc = 0;
    PROS.forEach(p=>{
      const l = its.filter(i => i.pro.id === p.id), f = soma(l,'tot'), ds = soma(l,'desc'), base = f - ds * 0, com = base * p.c;
      gq += l.length; gf += f; gb += base; gc += com;
      corpo += `<tr><td class="num" style="text-align:left">${p.id}</td><td>${p.n}</td><td class="num">${l.length}</td><td class="num">${brl(f)}</td><td class="num">${brl(ds)}</td><td class="num">${brl(base)}</td><td class="num">${pct(p.c)}</td><td class="num">${brl(com)}</td><td class="num">${brl(com)}</td></tr>`;
    });
    corpo += linhaTot(2, 'Total a pagar no mês', [gq, brl(gf), '', brl(gb), '', brl(gc), brl(gc)]) + '</tbody></table>';
    corpo += `<p class="note">Base de cálculo: valor total do atendimento concluído, sem taxas do meio de pagamento. Pagamento previsto até o 5º dia útil do mês seguinte.</p>
      <div class="sig"><div>Responsável pelo fechamento</div><div>Recebido por</div></div>`;
    return folha(D, 'Comissões a pagar', 'Regra: percentual por profissional sobre atendimentos concluídos', corpo);
  };
  R.recebimentos = D => {
    const its = ok(D), t = soma(its,'tot');
    let corpo = '<table><thead><tr><th>Forma de pagamento</th><th class="num">Qtd.</th><th class="num">Valor bruto</th><th class="num">Taxa</th><th class="num">Valor líquido</th><th class="num">Participação</th></tr></thead><tbody>';
    let gb = 0, gt = 0, gl = 0, gq = 0;
    FORMAS.forEach(f=>{
      const l = its.filter(i => i.forma.n === f.n), v = soma(l,'tot'), tx = v * f.tx, liq = v - tx;
      gb += v; gt += tx; gl += liq; gq += l.length;
      corpo += `<tr><td>${f.n}${f.tx ? ` <span class="mini">taxa ${pct(f.tx)}</span>` : ''}</td><td class="num">${l.length}</td><td class="num">${brl(v)}</td><td class="num">${tx ? brl(tx) : '—'}</td><td class="num">${brl(liq)}</td><td class="num">${pct(v / t)} <span class="bar" style="width:${Math.round(v / t * 60)}px"></span></td></tr>`;
    });
    corpo += linhaTot(1, 'Total recebido', [gq, brl(gb), brl(gt), brl(gl), '100,0%']) + '</tbody></table>';
    corpo += `<p class="note">Valor líquido já desconta a taxa do meio de pagamento. Repasses de cartão seguem o prazo da adquirente contratada.</p>`;
    return folha(D, 'Recebimentos por forma de pagamento', 'Status: pagamentos registrados no período', corpo);
  };
  R.caixa = D => {
    const its = ok(D);
    let corpo = `<table><thead><tr><th>Data</th><th>Dia</th><th class="num">Atend.</th><th class="num">Pix</th><th class="num">Crédito</th><th class="num">Débito</th><th class="num">Dinheiro</th><th class="num">Pacote</th><th class="num">Total do dia</th></tr></thead><tbody>`;
    const DS = ['dom','seg','ter','qua','qui','sex','sáb']; const tot = FORMAS.map(()=> 0); let gq = 0, gt = 0;
    for(let d = 1; d <= D.fim; d++){
      const l = its.filter(i => i.d.getDate() === d); if(!l.length) continue;
      const vals = FORMAS.map(f => soma(l.filter(i => i.forma.n === f.n), 'tot'));
      vals.forEach((v, i)=> tot[i] += v); const t = soma(l,'tot'); gq += l.length; gt += t;
      corpo += `<tr><td class="num" style="text-align:left">${d2(d)}/${d2(D.m+1)}</td><td>${DS[new Date(D.y, D.m, d).getDay()]}</td><td class="num">${l.length}</td>${vals.map(v=>`<td class="num">${v ? brl(v) : '—'}</td>`).join('')}<td class="num">${brl(t)}</td></tr>`;
    }
    corpo += linhaTot(2, 'Total do mês', [gq, ...tot.map(v=> brl(v)), brl(gt)]) + '</tbody></table>';
    corpo += `<div class="sig"><div>Conferido por</div><div>Responsável financeiro</div></div>`;
    return folha(D, 'Caixa diário', 'Entradas por dia e por forma de pagamento', corpo);
  };
  R.servicos = D => {
    const its = ok(D), t = soma(its,'tot');
    const linhas = SVC.map(s=>{ const l = its.filter(i => i.svc === s.n); return { n:s.n, q:l.length, v:soma(l,'tot'), p:s.p }; }).filter(x=> x.q).sort((a,b)=> b.v - a.v);
    let corpo = '<table><thead><tr><th>Serviço</th><th class="num">Qtd.</th><th class="num">Preço de tabela</th><th class="num">Ticket médio</th><th class="num">Faturamento</th><th class="num">Participação</th></tr></thead><tbody>';
    corpo += linhas.map(x=>`<tr><td>${x.n}</td><td class="num">${x.q}</td><td class="num">${brl(x.p)}</td><td class="num">${brl(x.v / x.q)}</td><td class="num">${brl(x.v)}</td><td class="num">${pct(x.v / t)} <span class="bar" style="width:${Math.round(x.v / t * 60)}px"></span></td></tr>`).join('');
    corpo += linhaTot(1, 'Total', [soma(linhas,'q'), '', '', brl(t), '100,0%']) + '</tbody></table>';
    return folha(D, 'Serviços realizados', 'Status: somente atendimentos concluídos', corpo);
  };
  R.clientes = D => {
    const its = ok(D), novos = its.filter(i => i.novo), rec = its.filter(i => !i.novo);
    const porCli = {}; its.forEach(i=>{ porCli[i.cli] = porCli[i.cli] || { q:0, v:0 }; porCli[i.cli].q++; porCli[i.cli].v += i.tot; });
    const top = Object.entries(porCli).map(([n, x])=> ({ n, ...x })).sort((a,b)=> b.v - a.v).slice(0, 10);
    const boxes = `<div class="boxes"><div class="box"><small>Atendimentos</small><b>${its.length}</b></div><div class="box"><small>Clientes atendidos</small><b>${Object.keys(porCli).length}</b></div><div class="box"><small>Novos</small><b>${novos.length}</b></div><div class="box"><small>Retorno</small><b>${pct(rec.length / its.length)}</b></div></div>`;
    let corpo = boxes + '<table><thead><tr><th>Cliente</th><th class="num">Atendimentos</th><th class="num">Ticket médio</th><th class="num">Total no mês</th></tr></thead><tbody>';
    corpo += `<tr class="grp"><td colspan="4">10 clientes que mais movimentaram</td></tr>`;
    corpo += top.map(c=>`<tr><td>${c.n}</td><td class="num">${c.q}</td><td class="num">${brl(c.v / c.q)}</td><td class="num">${brl(c.v)}</td></tr>`).join('');
    corpo += linhaTot(1, 'Subtotal dos 10 maiores', [soma(top,'q'), '', brl(soma(top,'v'))]) + '</tbody></table>';
    corpo += `<p class="note">Retorno é a parcela de atendimentos feitos por clientes que já haviam sido atendidos antes. Clientes fora do ciclo do serviço aparecem no painel em “Hora de voltar”.</p>`;
    return folha(D, 'Clientes e retorno', 'Base: atendimentos concluídos no período', corpo);
  };
  R.faltas = D => {
    const f = D.its.filter(i => i.st === 'falta'), c = D.its.filter(i => i.st === 'cancelado');
    const tf = soma(f,'tot'), tc = soma(c,'tot');
    const boxes = `<div class="boxes"><div class="box"><small>Faltas</small><b>${f.length}</b></div><div class="box"><small>Cancelamentos</small><b>${c.length}</b></div><div class="box"><small>Receita não realizada</small><b>${brl(tf + tc)}</b></div><div class="box"><small>Taxa de falta</small><b>${pct(f.length / D.its.length)}</b></div></div>`;
    let corpo = boxes + '<table><thead><tr><th>Data</th><th>Nº</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Situação</th><th class="num">Valor</th></tr></thead><tbody>';
    const rows = [...f.map(x=> ({...x, t:'falta'})), ...c.map(x=> ({...x, t:'cancelado'}))].sort((a,b)=> a.d - b.d);
    corpo += rows.map(i=>`<tr><td class="num" style="text-align:left">${d2(i.d.getDate())}/${d2(D.m+1)}</td><td class="num" style="text-align:left">${i.id}</td><td>${i.cli}</td><td>${i.svc}</td><td>${i.pro.n}</td><td><span class="pill ${i.t === 'falta' ? 'no' : 'wa'}">${i.t === 'falta' ? 'Faltou' : 'Cancelado'}</span></td><td class="num">${brl(i.tot)}</td></tr>`).join('');
    corpo += linhaTot(6, 'Receita não realizada no mês', [brl(tf + tc)]) + '</tbody></table>';
    corpo += `<p class="note">Falta é o horário perdido sem aviso e sem reocupação. Cancelamento avisado com antecedência permite reabrir o horário — por isso aparece separado.</p>`;
    return folha(D, 'Faltas e cancelamentos', 'Status: horários não realizados', corpo);
  };
  R.assinaturas = D => {
    const planos = [ {n:'Assinatura mensal — Escova ilimitada', v:189, q:14}, {n:'Pacote 5 sessões — Limpeza de pele', v:640, q:6}, {n:'Assinatura mensal — Barba e cabelo', v:149, q:9}, {n:'Pacote 10 sessões — Manicure', v:340, q:4} ];
    let corpo = '<table><thead><tr><th>Plano / pacote</th><th class="num">Ativos</th><th class="num">Valor unitário</th><th class="num">Receita recorrente</th><th class="num">Sessões usadas</th><th class="num">A usar</th></tr></thead><tbody>';
    let gq = 0, gv = 0;
    planos.forEach((p, i)=>{ const usadas = Math.round(p.q * (2.2 + rnd('u'+i) * 1.6)), aUsar = Math.round(p.q * (1.4 + rnd('a'+i))); gq += p.q; gv += p.v * p.q;
      corpo += `<tr><td>${p.n}</td><td class="num">${p.q}</td><td class="num">${brl(p.v)}</td><td class="num">${brl(p.v * p.q)}</td><td class="num">${usadas}</td><td class="num">${aUsar}</td></tr>`; });
    corpo += linhaTot(1, 'Total no mês', [gq, '', brl(gv), '', '']) + '</tbody></table>';
    corpo += `<p class="note">Receita recorrente é o valor cobrado no mês pelos planos ativos. Sessões “a usar” são compromissos já pagos que ainda ocupam agenda nos próximos meses.</p>`;
    return folha(D, 'Assinaturas e pacotes', 'Base: planos ativos na competência', corpo);
  };
  R.resumo = D => {
    const its = ok(D), bruto = soma(its,'bruto'), desc = soma(its,'desc'), acr = soma(its,'acr'), liq = soma(its,'tot');
    const taxas = soma(its, i => i.tot * i.forma.tx), com = PROS.reduce((s, p)=> s + soma(its.filter(i => i.pro.id === p.id), 'tot') * p.c, 0);
    const fixos = 4200, result = liq - taxas - com - fixos;
    const f = D.its.filter(i => i.st === 'falta'), perdida = soma(f,'tot');
    const boxes = `<div class="boxes"><div class="box"><small>Receita líquida</small><b>${brl(liq)}</b></div><div class="box"><small>Atendimentos</small><b>${its.length}</b></div><div class="box"><small>Ticket médio</small><b>${brl(liq / its.length)}</b></div><div class="box"><small>Resultado</small><b>${brl(result)}</b></div></div>`;
    const l = (t, v, lv) => `<tr class="${lv ? 'lv2' : ''}"><td>${t}</td><td class="num">${v}</td></tr>`;
    let corpo = boxes + '<table class="dre"><thead><tr><th>Descrição</th><th class="num">Valor</th></tr></thead><tbody>';
    corpo += `<tr class="grp"><td colspan="2">Receita</td></tr>` + l('Serviços realizados (valor de tabela)', brl(bruto)) + l('Descontos concedidos', '-' + brl(desc), 1) + l('Acréscimos', brl(acr), 1) + `<tr class="sum"><td>Receita líquida de serviços</td><td class="num">${brl(liq)}</td></tr><tr class="sp"><td colspan="2"></td></tr>`;
    corpo += `<tr class="grp"><td colspan="2">Custos e despesas</td></tr>` + l('Comissões da equipe', '-' + brl(com), 1) + l('Taxas de meios de pagamento', '-' + brl(taxas), 1) + l('Despesas fixas (aluguel, energia, produtos, sistema)', '-' + brl(fixos), 1) + `<tr class="sum"><td>Total de custos e despesas</td><td class="num">-${brl(com + taxas + fixos)}</td></tr><tr class="sp"><td colspan="2"></td></tr>`;
    corpo += linhaTot(1, 'Resultado do mês', [brl(result)]) + '</tbody></table>';
    corpo += `<p class="note">Margem de ${pct(result / liq)} sobre a receita líquida. Faltas do mês deixaram de gerar ${brl(perdida)} — equivale a ${pct(perdida / liq)} da receita. Despesas fixas são um valor informado pelo proprietário nas configurações.</p>`;
    corpo += `<div class="sig"><div>Responsável pelo negócio</div><div>Contabilidade</div></div>`;
    return folha(D, 'Resumo do mês', 'Visão consolidada de receita, custos e resultado', corpo);
  };

  /* ---------- CSV ---------- */
  function csv(){
    const t = $('.sheet table'); if(!t) return;
    const linhas = $$('tr', t).map(tr => $$('th,td', tr).map(td => '"' + td.innerText.replace(/\s+/g,' ').trim().replace(/"/g,'""') + '"').join(';')).join('\r\n');
    const blob = new Blob(['﻿' + linhas], { type:'text/csv;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `khrono-${atual}-${ref.getFullYear()}-${d2(ref.getMonth()+1)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }

  /* ---------- interface ---------- */
  let atual = 'profissional';
  const sel = $('#fMes');
  for(let i = 0; i < 12; i++){ const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); sel.insertAdjacentHTML('beforeend', `<option value="${d.getFullYear()}-${d.getMonth()}">${MES[d.getMonth()]} / ${d.getFullYear()}</option>`); }
  function render(){
    const D = gerar(ref);
    $('#paper').innerHTML = R[atual](D);
    $('#tTitle').textContent = $('.rtitle').textContent.replace(/^./, c=> c.toUpperCase()).toLowerCase().replace(/^./, c=> c.toUpperCase());
    document.title = $('.rtitle').textContent + ' — ' + MES[ref.getMonth()] + '/' + ref.getFullYear() + ' — Khrono';
    $('#paper').scrollIntoView({ block:'start', behavior:'instant' });
  }
  $('#nav').addEventListener('click', e=>{ const b = e.target.closest('button'); if(!b) return; $$('#nav button').forEach(o=> o.classList.toggle('on', o === b)); atual = b.dataset.r; document.body.classList.remove('menu'); render(); });
  sel.addEventListener('change', ()=>{ const [y, m] = sel.value.split('-').map(Number); ref = new Date(y, m, 1); render(); });
  $('#fUni').addEventListener('change', e=>{ EMP.nome = e.target.value; render(); });
  $('#print').addEventListener('click', ()=> print());
  $('#csv').addEventListener('click', csv);
  $('#burger').addEventListener('click', ()=> document.body.classList.toggle('menu'));
  // abre direto por link: relatorios/#comissoes
  const byHash = ()=>{ const h = location.hash.slice(1); const b = $(`#nav [data-r="${h}"]`); if(b){ $$('#nav button').forEach(o=> o.classList.toggle('on', o === b)); atual = h; } };
  byHash(); addEventListener('hashchange', ()=>{ byHash(); render(); });
  render();
})();
