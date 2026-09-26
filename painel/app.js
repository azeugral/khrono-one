/* Painel do negócio — Khrono (demonstração). Dados fictícios gerados de forma determinística;
   trocar as funções de D por chamadas da API mantém o resto igual. */
(function(){
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brl = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  const brl2 = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const num = v => Math.round(v).toLocaleString('pt-BR');
  const DS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const rnd = s => { let h = 2166136261; for(const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 1e4) / 1e4; };

  /* ---------- dados de demonstração ---------- */
  const EQUIPE = [ {n:'Ana Ribeiro', i:'AR'}, {n:'Bruno Costa', i:'BC'}, {n:'Camila Duarte', i:'CD'}, {n:'Diego Martins', i:'DM'} ];
  const SERVICOS = [ {n:'Corte feminino', p:80}, {n:'Escova modelada', p:60}, {n:'Coloração', p:180}, {n:'Limpeza de pele', p:150}, {n:'Design de sobrancelhas', p:45}, {n:'Corte masculino', p:55} ];
  const dia = i => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i); return d; };
  const movDia = d => { const w = d.getDay(), base = w === 0 ? 0 : w === 6 ? 1.35 : w === 5 ? 1.25 : w === 1 ? .72 : 1; return base * (0.75 + rnd(d.toDateString()) * 0.5); };
  const serie = n => { const out = []; for(let i = n - 1; i >= 0; i--){ const d = dia(i), m = movDia(d); out.push({ d, ags: Math.round(m * 11), fat: Math.round(m * 11 * (78 + rnd('t'+d.getDate()) * 46)) }); } return out; };
  const soma = (a, k) => a.reduce((s, x) => s + x[k], 0);
  const P = { hoje:1, '7':7, '30':30, '365':365 };
  function dados(pkey){
    const n = P[pkey], cur = serie(n), prevAll = serie(n * 2).slice(0, n);
    const fat = soma(cur,'fat'), ags = soma(cur,'ags'), pfat = soma(prevAll,'fat'), pags = soma(prevAll,'ags');
    const horasDisp = n * EQUIPE.length * 6 * (5/7), horasUsa = ags * 1.12;   // 6h de agenda por profissional, ~1h07 por atendimento
    const ocu = Math.min(94, Math.round(horasUsa / horasDisp * 100)), pocu = Math.max(30, ocu - 4 - Math.round(rnd(pkey) * 6));
    const concl = Math.round(ags * 0.92), tkt = fat / Math.max(1, concl), ptkt = pfat / Math.max(1, Math.round(pags * 0.92));
    const faltas = Math.max(1, Math.round(ags * 0.052)), cancel = Math.max(1, Math.round(ags * 0.037)), perda = Math.round(faltas * tkt);
    const novos = Math.round(ags * 0.24), recor = concl - novos;
    return { cur, prev:prevAll, fat, ags, ocu, pocu, tkt, ptkt, pfat, pags, concl, faltas, cancel, perda, novos, recor, n };
  }
  const PAG = [ {n:'Pix', c:'var(--c1)', p:.38}, {n:'Cartão de crédito', c:'var(--c2)', p:.29}, {n:'Cartão de débito', c:'var(--c3)', p:.16}, {n:'Dinheiro', c:'var(--c4)', p:.11}, {n:'Pacote / assinatura', c:'var(--c5)', p:.06} ];
  const VOLTAR = [ {n:'Júlia Prado', i:'JP', s:'Coloração', d:12}, {n:'Marcos Lima', i:'ML', s:'Corte masculino', d:9}, {n:'Rita Alves', i:'RA', s:'Limpeza de pele', d:7}, {n:'Sofia Neves', i:'SN', s:'Escova modelada', d:5} ];

  /* ---------- helpers de render ---------- */
  const anim = (el, to, fmt, dur=1100) => {
    if(reduce){ el.textContent = fmt(to); el.dataset.cur = to; return; }
    const from = +(el.dataset.cur || 0), t0 = performance.now(), ease = t => 1 - Math.pow(1 - t, 3);
    const step = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = fmt(from + (to - from) * ease(p)); if(p < 1) requestAnimationFrame(step); else el.dataset.cur = to; };
    requestAnimationFrame(step);
  };
  const chip = (el, cur, prev) => {
    const d = prev ? (cur - prev) / prev * 100 : 0, up = d >= 0;
    el.className = 'chip ' + (Math.abs(d) < 0.5 ? 'flat' : up ? '' : 'down');
    el.innerHTML = (Math.abs(d) < 0.5 ? '—' : (up ? '▲' : '▼') + ' ' + Math.abs(d).toFixed(1).replace('.', ',') + '%');
  };
  const path = (pts, close, w, h) => {
    let p = pts.map((pt, i) => (i ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' ');
    if(close) p += ` L${w} ${h} L0 ${h} Z`;
    return p;
  };
  const spark = (svg, arr) => {
    const w = 120, h = 34, max = Math.max(...arr), min = Math.min(...arr), rg = max - min || 1;
    const pts = arr.map((v, i) => [i / (arr.length - 1) * w, h - 4 - (v - min) / rg * (h - 8)]);
    svg.innerHTML = `<path d="${path(pts, true, w, h)}" fill="var(--acc-soft)"/><path d="${path(pts)}" fill="none" stroke="var(--acc2)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  };

  /* ---------- gráfico de movimento ---------- */
  let modo = 'fat';
  function movimento(D){
    const box = $('#mov'), W = box.clientWidth || 640, H = box.clientHeight || 220, pl = 46, pb = 22, pt = 10;
    const cur = D.cur.map(x => x[modo]), prev = D.prev.map(x => x[modo]);
    let raw = Math.max(...cur, ...prev) * 1.12 || 1;
    const mag = Math.pow(10, Math.floor(Math.log10(raw))), max = Math.ceil(raw / (mag/2)) * (mag/2);
    const iw = W - pl - 8, ih = H - pb - pt;
    const X = i => pl + (cur.length === 1 ? iw / 2 : i / (cur.length - 1) * iw), Y = v => pt + ih - v / max * ih;
    const p1 = cur.map((v, i) => [X(i), Y(v)]), p0 = prev.map((v, i) => [X(i), Y(v)]);
    const ticks = 4, gl = Array.from({length: ticks + 1}, (_, i) => { const v = max / ticks * i, y = Y(v); return `<line class="gl" x1="${pl}" y1="${y}" x2="${W}" y2="${y}"/><text class="lbl" x="0" y="${y + 3}">${v >= 1000 ? (v/1000).toLocaleString('pt-BR', {maximumFractionDigits:1}) + 'k' : Math.round(v)}</text>`; }).join('');
    const passo = Math.max(1, Math.round(cur.length / 6));
    const xl = D.cur.map((x, i) => i % passo === 0 || i === cur.length - 1 ? `<text class="lbl" x="${X(i)}" y="${H - 4}" text-anchor="middle">${D.n > 90 ? (x.d.getMonth()+1) + '/' + String(x.d.getFullYear()).slice(2) : x.d.getDate() + '/' + (x.d.getMonth()+1)}</text>` : '').join('');
    const hits = D.cur.map((x, i) => `<g class="hitg" data-i="${i}"><line class="vline" x1="${X(i)}" y1="${pt}" x2="${X(i)}" y2="${pt+ih}"/><circle class="dot" cx="${X(i)}" cy="${Y(cur[i])}" r="4.5"/><rect class="hit" x="${X(i) - iw/cur.length/2}" y="${pt}" width="${iw/cur.length}" height="${ih}"/></g>`).join('');
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="gAcc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--acc2)" stop-opacity=".38"/><stop offset="100%" stop-color="var(--acc2)" stop-opacity="0"/></linearGradient></defs>
      ${gl}<path class="areaPrev fadein" d="${path(p0, true, W, pt+ih)}"/><path class="linePrev fadein" d="${path(p0)}"/>
      <path class="area fadein" d="${path(p1, true, W, pt+ih)}"/><path class="line draw" d="${path(p1)}"/>${xl}${hits}</svg>`;
    const line = $('.line', box); if(line && !reduce){ const len = line.getTotalLength(); line.style.setProperty('--len', len); }
    const tip = $('#tip');
    $$('.hitg', box).forEach(g=>{
      g.addEventListener('pointerenter', ()=>{
        $$('.hitg', box).forEach(o=> o.classList.remove('on')); g.classList.add('on');
        const i = +g.dataset.i, x = D.cur[i];
        tip.innerHTML = `<b>${DS[x.d.getDay()]}, ${x.d.getDate()}/${x.d.getMonth()+1}</b><br>${brl(x.fat)} · ${x.ags} agendamentos`;
        const r = g.getBoundingClientRect(); tip.style.left = Math.min(innerWidth - 270, r.left) + 'px'; tip.style.top = (r.top + scrollY - 8) + 'px'; tip.classList.add('on');
      });
    });
    box.addEventListener('pointerleave', ()=>{ $$('.hitg', box).forEach(o=> o.classList.remove('on')); tip.classList.remove('on'); });
  }

  /* ---------- widgets ---------- */
  function agendaHoje(){
    const now = new Date(), h0 = 9, out = [];
    for(let m = h0*60; m <= 18*60; m += 45){
      const r = rnd('ag' + m), hh = String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
      if(r < 0.18){ out.push({ h:hh, livre:true }); continue; }
      const s = SERVICOS[Math.floor(rnd('s'+m) * SERVICOS.length)], p = EQUIPE[Math.floor(rnd('p'+m) * EQUIPE.length)];
      out.push({ h:hh, nome:['Júlia Prado','Marcos Lima','Rita Alves','Sofia Neves','Paulo Dias','Helena Gil','Tiago Moura'][Math.floor(r * 7)], s:s.n, p:p.n, ok: r > 0.34, m });
    }
    const agora = now.getHours()*60 + now.getMinutes();
    $('#tl').innerHTML = out.map(x=> x.livre
      ? `<li class="free"><span class="hr">${x.h}</span><span><b>Horário livre</b><small>ninguém marcou ainda</small></span><span class="st free">Livre</span></li>`
      : `<li class="${x.m <= agora && x.m + 45 > agora ? 'now' : ''}"><span class="hr">${x.h}</span><span><b>${x.nome}</b><small>${x.s} · ${x.p}</small></span><span class="st ${x.ok ? '' : 'wait'}">${x.ok ? 'Confirmado' : 'Aguardando'}</span></li>`).join('');
    const marcados = out.filter(x=> !x.livre).length;
    $('#todayTag').textContent = `${marcados} de ${out.length} horários`;
  }
  function heat(){
    const faixas = ['09h','11h','13h','15h','17h'];
    let html = '<span></span>' + DS.map(d=>`<span class="hd">${d}</span>`).join('');
    let best = { v:0 };
    faixas.forEach((f, fi)=>{
      html += `<span class="rw">${f}</span>`;
      DS.forEach((d, di)=>{
        let v = di === 0 ? 0.04 : (0.3 + rnd('h'+fi+di) * 0.55) * (di >= 4 ? 1.35 : 1) * (fi === 1 || fi === 3 ? 1.15 : 1);
        v = Math.min(1, v); if(v > best.v) best = { v, d:DS[di], f };
        html += `<i style="--v:${v.toFixed(2)}" data-tip="${DS[di]}, ${f} · ${Math.round(v * 9)} atendimentos"></i>`;
      });
    });
    $('#heat').innerHTML = html;
    $('#heatHint').innerHTML = `Pico em <b>${best.d}, ${best.f}</b>. Segunda de manhã é o horário mais vazio — bom para encaixe ou promoção.`;
  }
  function donut(D){
    const R = 46, C = 2 * Math.PI * R; let off = 0;
    $('#donut').innerHTML = PAG.map(p=>{
      const len = p.p * C, el = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${p.c}" stroke-width="15" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`;
      off += len; return el;
    }).join('') + `<text class="lb" x="60" y="58" text-anchor="middle">${brl(D.fat)}</text><text class="ls" x="60" y="70" text-anchor="middle">recebido no período</text>`;
    $('#donutLeg').innerHTML = PAG.map(p=>`<li><i style="background:${p.c}"></i><span>${p.n}</span><b>${brl(D.fat * p.p)}</b></li>`).join('');
  }
  let teamModo = 'fat';
  function team(D){
    const vals = EQUIPE.map((e, i)=> ({ ...e, fat: Math.round(D.fat * [0.31, 0.27, 0.23, 0.19][i] * (0.9 + rnd('e'+i) * 0.2)), ocu: Math.min(97, 58 + Math.round(rnd('o'+i) * 36)) }));
    vals.sort((a,b)=> b[teamModo] - a[teamModo]);
    const max = Math.max(...vals.map(v=> v[teamModo]));
    $('#team').innerHTML = vals.map(v=>`<li><span class="av">${v.i}</span><span><b>${v.n}</b><small>${teamModo === 'fat' ? Math.round(v.fat / (D.tkt || 1)) + ' atendimentos · comissão ' + brl(v.fat * 0.4) : v.ocu + '% da agenda usada'}</small><span class="bar"><i style="width:0" data-w="${v[teamModo] / max * 100}"></i></span></span><span class="n">${teamModo === 'fat' ? brl(v.fat) : v.ocu + '%'}</span></li>`).join('');
  }
  function svcs(D){
    const vals = SERVICOS.map((s, i)=> ({ ...s, q: Math.max(1, Math.round(D.concl * [0.26, 0.21, 0.14, 0.16, 0.13, 0.1][i] * (0.9 + rnd('v'+i) * 0.2))) }))
      .map(s=> ({ ...s, t: s.q * s.p })).sort((a,b)=> b.t - a.t).slice(0, 5);
    const max = vals[0].t;
    $('#svcs').innerHTML = vals.map((s, i)=>`<li><span class="i">0${i+1}</span><span><b>${s.n}</b><small>${s.q} atendimentos · ${brl2(s.p)} cada</small><span class="bar"><i style="width:0" data-w="${s.t / max * 100}"></i></span></span><span class="n">${brl(s.t)}</span></li>`).join('');
  }
  function voltar(){
    $('#back').innerHTML = VOLTAR.map(v=>`<li><span class="av">${v.i}</span><span><b>${v.n}</b><small>${v.s}</small></span><span class="d">${v.d} dias</span></li>`).join('');
  }
  function gauge(D){
    const meta = 42000, fatMes = Math.round(D.n >= 30 ? D.fat * (30 / D.n) * 0.92 : D.fat * (30 / D.n) * 0.92);
    const pct = Math.min(100, Math.round(fatMes / meta * 100)), R = 48, C = 2 * Math.PI * R;
    $('#gauge').innerHTML = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--muted)" stroke-width="12"/>
      <circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--acc2)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 60 60)" id="gArc"/>
      <text class="pc" x="60" y="62" text-anchor="middle">${pct}%</text><text class="pl" x="60" y="74" text-anchor="middle">da meta</text>`;
    setTimeout(()=>{ const a = $('#gArc'); if(a) a.setAttribute('stroke-dashoffset', C * (1 - pct/100)); }, 120);
    $('#meta').textContent = brl(meta);
    anim($('[data-key="fatMes"]'), fatMes, brl);
    const falta = meta - fatMes, dias = 30 - new Date().getDate();
    $('#goalHint').innerHTML = falta > 0 ? `Faltam <b>${brl(falta)}</b> em ${dias} dias — cerca de <b>${brl(falta / Math.max(1, dias))}</b> por dia.` : 'Meta batida neste mês.';
  }

  /* ---------- pintura geral ---------- */
  let periodo = '30';
  function render(){
    const D = dados(periodo);
    anim($('[data-key="fat"]'), D.fat, brl); anim($('[data-key="ags"]'), D.ags, num);
    anim($('[data-key="ocu"]'), D.ocu, v=> Math.round(v) + '%'); anim($('[data-key="tkt"]'), D.tkt, brl2);
    anim($('[data-key="novos"]'), D.novos, num); anim($('[data-key="recor"]'), D.recor, num);
    anim($('[data-key="faltas"]'), D.faltas, num); anim($('[data-key="cancel"]'), D.cancel, num); anim($('[data-key="perda"]'), D.perda, brl);
    chip($('[data-chip="fat"]'), D.fat, D.pfat); chip($('[data-chip="ags"]'), D.ags, D.pags);
    chip($('[data-chip="ocu"]'), D.ocu, D.pocu); chip($('[data-chip="tkt"]'), D.tkt, D.ptkt);
    spark($('[data-spark="fat"]'), D.cur.map(x=>x.fat)); spark($('[data-spark="ags"]'), D.cur.map(x=>x.ags)); spark($('[data-spark="tkt"]'), D.cur.map(x=> x.fat / Math.max(1, x.ags)));
    $('[data-fill="ocu"]').style.width = D.ocu + '%';
    $('[data-fill="novosPct"]').style.width = (D.novos / Math.max(1, D.novos + D.recor) * 100) + '%';
    $('#cliHint').innerHTML = `<b>${Math.round(D.recor / Math.max(1, D.novos + D.recor) * 100)}%</b> dos atendimentos foram de clientes que já conheciam a casa.`;
    $('#confPct').textContent = (72 + Math.round(rnd(periodo) * 14)) + '%';
    movimento(D); agendaHoje(); heat(); donut(D); team(D); svcs(D); voltar(); gauge(D);
    requestAnimationFrame(()=> $$('[data-w]').forEach(i=> i.style.width = i.dataset.w + '%'));
    $('#upd').textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    window.__D = D;
  }

  /* ---------- interação ---------- */
  const seg = $('#fPeriodo'), ind = $('.ind', seg);
  const place = b => { ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; };
  $$('button', seg).forEach(b=> b.addEventListener('click', ()=>{
    $$('button', seg).forEach(o=> o.setAttribute('aria-selected', String(o === b))); place(b); periodo = b.dataset.p; load();
  }));
  const replace = ()=> place($('[aria-selected="true"]', seg));
  replace(); addEventListener('load', replace); if(document.fonts) document.fonts.ready.then(replace);
  addEventListener('resize', ()=>{ const replace = ()=> place($('[aria-selected="true"]', seg));
  replace(); addEventListener('load', replace); if(document.fonts) document.fonts.ready.then(replace); if(window.__D) movimento(window.__D); });
  $('#movTabs').addEventListener('click', e=>{ const b = e.target.closest('button'); if(!b) return; $$('#movTabs button').forEach(o=> o.classList.toggle('on', o === b)); modo = b.dataset.m; movimento(window.__D); });
  $('#teamTabs').addEventListener('click', e=>{ const b = e.target.closest('button'); if(!b) return; $$('#teamTabs button').forEach(o=> o.classList.toggle('on', o === b)); teamModo = b.dataset.t; team(window.__D); requestAnimationFrame(()=> $$('#team [data-w]').forEach(i=> i.style.width = i.dataset.w + '%')); });
  function load(){ document.body.classList.add('loading'); setTimeout(()=>{ render(); document.body.classList.remove('loading'); }, reduce ? 0 : 420); }
  $('#refresh').addEventListener('click', load);
  $$('#fUnidade, #fPro').forEach(s=> s.addEventListener('change', load));
  $('#burger').addEventListener('click', ()=> document.body.classList.toggle('menu'));
  $('.main').addEventListener('click', ()=> document.body.classList.remove('menu'));
  $('#sendBack').addEventListener('click', e=>{ e.target.textContent = 'Lembretes enviados ✓'; e.target.disabled = true; });
  // dicas
  const tip = $('#tip');
  document.addEventListener('pointerover', e=>{
    const el = e.target.closest('[data-tip]'); if(!el) return;
    tip.textContent = el.dataset.tip; const r = el.getBoundingClientRect();
    tip.style.left = Math.min(innerWidth - 280, Math.max(8, r.left - 8)) + 'px'; tip.style.top = (r.bottom + scrollY + 8) + 'px'; tip.classList.add('on');
  });
  document.addEventListener('pointerout', e=>{ if(e.target.closest('[data-tip]')) tip.classList.remove('on'); });
  // tema (claro por padrão)
  try{ const t = localStorage.getItem('kh-theme'); if(t) document.documentElement.dataset.theme = t; }catch(e){}
  $('#theme').addEventListener('click', ()=>{ const r = document.documentElement, next = r.dataset.theme === 'dark' ? 'light' : 'dark'; r.dataset.theme = next; try{ localStorage.setItem('kh-theme', next); }catch(e){} if(window.__D) movimento(window.__D); });
  render();
  // o painel respira: a cada 20s chega um agendamento novo
  if(!reduce) setInterval(()=>{ const D = window.__D; if(!D) return; D.ags += 1; D.fat += Math.round(D.tkt); anim($('[data-key="ags"]'), D.ags, num); anim($('[data-key="fat"]'), D.fat, brl, 700); $('#upd').textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }); }, 20000);
})();
