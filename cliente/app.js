/* Página do cliente — réplica do fluxo /b/<slug> do Khrono com dados de demonstração.
   Boas-vindas → 1 Serviços → 2 Membro da equipe → 3 Dia e horário → 4 Revisão → Tudo certo. Tudo em memória, sem back-end. */
(function(){
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const B = {
    nome:'Studio Exemplo', ini:'SE', tel:'+55 11 99999-0000', capa:'../assets/img/hero-clinica.jpg',
    tagline:'Um tempo para você. Seu próximo atendimento começa aqui.',
    politica:'Cancelamentos e remarcações devem ser feitos com pelo menos 12 horas de antecedência. Atrasos acima de 10 minutos podem reduzir o tempo do atendimento.',
    servicos:[
      { id:'s1', nome:'Corte feminino', desc:'Lavagem, corte e finalização', min:45, max:60, preco:80 },
      { id:'s2', nome:'Escova modelada', desc:'Escova com finalização a seu gosto', min:30, max:45, preco:60 },
      { id:'s3', nome:'Limpeza de pele', desc:'Higienização, extração e máscara calmante', min:60, max:75, preco:150 },
      { id:'s4', nome:'Design de sobrancelhas', desc:'Modelagem com pinça e acabamento', min:20, max:30, preco:45 },
    ],
    equipe:[ { id:'p1', nome:'Ana Ribeiro', ini:'AR' }, { id:'p2', nome:'Bruno Costa', ini:'BC' }, { id:'p3', nome:'Camila Duarte', ini:'CD' } ],
  };
  const S = { tela:'wel', passo:1, svc:[], pro:null, mes:null, dia:null, hora:null, nome:'', email:'', ddi:'+55', tel:'', obs:'', com:false, aceite:false };
  const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');
  const DS = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'], DL = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const ML = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const I = {
    check:'<svg viewBox="0 0 24 24"><path d="M20 6.5L9.4 17.1 4 11.7"/></svg>', clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    cal:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>', calok:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/></svg>',
    user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>', mail:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    gift:'<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8c-2-3-6-3-6-1s3 1 6 1zm0 0c2-3 6-3 6-1s-3 1-6 1z"/></svg>',
    left:'<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>', right:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>', login:'<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></svg>',
  };
  const svc = id => B.servicos.find(s=>s.id===id), pro = id => B.equipe.find(p=>p.id===id);
  const dur = ()=> S.svc.reduce((a,id)=>a+svc(id).min, 0) + '–' + S.svc.reduce((a,id)=>a+svc(id).max, 0) + ' min';
  const durEst = ()=> Math.round(S.svc.reduce((a,id)=>a+(svc(id).min+svc(id).max)/2, 0)) + ' min';
  const total = ()=> S.svc.reduce((a,id)=>a+svc(id).preco, 0);
  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  // disponibilidade de demonstração: segunda a sábado, a partir de amanhã, até 60 dias; horários 09:00–17:15 de 15 em 15, sem 11:30–12:45
  const aberto = d => { const diff = (d - hoje) / 864e5; return diff >= 1 && diff <= 60 && d.getDay() !== 0; };
  const seed = s => { let h = 0; for(const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const horas = d => { const out = []; for(let m = 9*60; m <= 17*60+15; m += 15){ if(m >= 11*60+30 && m < 12*60+45) continue; if((seed(iso(d)+m) % 7) === 0) continue; out.push(String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')); } return out; };

  /* ---------- telas ---------- */
  const head = ()=> `<div class="biz"><i>${B.ini}</i><div><small>Agendamento online</small><b>${B.nome}</b></div></div>
    <ol class="steps">${['Serviços','Membro da equipe','Dia e horário','Revisão'].map((t,i)=>`<li class="${S.passo===i+1?'on':S.passo>i+1?'done':''}"><i>${I.check}<span>${i+1}</span></i>${t}</li>`).join('')}</ol>`;
  const bar = (ok, label='Continuar', icon=I.right)=> `<div class="bar"><button class="btn back" data-back>${I.left} Voltar</button><button class="btn acc" id="next" ${ok?'':'disabled'}>${label} ${icon}</button></div>`;

  const T = {
    wel: ()=> `<section class="hero"><img src="${B.capa}" alt=""><div><span class="eyebrow">Agendamento online</span><h1>${B.nome}</h1><p>${B.tagline}</p><p class="tel">${B.tel}</p></div></section>
      <section class="wel fade"><span class="eyebrow">Boas-vindas</span><h2>Como deseja continuar?</h2><p class="sub">Escolha seu serviço e reserve um horário.</p>
      <div class="gift">${I.gift}<span>Na sua conta, acompanhe agendamentos e benefícios de fidelidade.</span></div>
      <button class="btn acc" data-go="google">${I.login} Entrar com Google</button><button class="btn" data-go="start">Continuar sem login ${I.right}</button></section>
      <div class="powered"><span>Agenda por</span><img src="../assets/img/brand/horizontal-light.svg" alt="Khrono"></div>`,
    1: ()=> `${head()}<div class="wrap fade"><span class="lbl">Etapa 1 de 4</span><h2 class="q">Quais serviços você deseja?</h2><div class="list">${B.servicos.map(s=>`<button class="opt ${S.svc.includes(s.id)?'on':''}" data-svc="${s.id}"><span class="t"><b>${s.nome}</b><span>${s.desc}</span><small>${I.clock}${s.min} a ${s.max} min</small><em>${brl(s.preco)}</em></span><span class="ck sq">${I.check}</span></button>`).join('')}</div></div>${bar(S.svc.length>0)}`,
    2: ()=> `${head()}<div class="wrap fade"><span class="lbl">Etapa 2 de 4</span><h2 class="q">Quem vai atender você?</h2><div class="list">${B.equipe.map(p=>`<button class="opt ${S.pro===p.id?'on':''}" data-pro="${p.id}"><span class="row"><span class="av">${p.ini}</span><span class="t"><b>${p.nome}</b></span></span><span class="ck">${I.check}</span></button>`).join('')}</div></div>${bar(!!S.pro)}`,
    3: ()=>{
      const m = S.mes, y = m.getFullYear(), mo = m.getMonth(), first = new Date(y,mo,1).getDay(), n = new Date(y,mo+1,0).getDate();
      let cells = ''; for(let i=0;i<first;i++) cells += '<span></span>';
      for(let d=1; d<=n; d++){ const dt = new Date(y,mo,d), ok = aberto(dt), sel = S.dia && iso(S.dia)===iso(dt); cells += `<button class="d ${ok?'ok':''} ${sel?'sel':''}" data-dia="${iso(dt)}" ${ok?'':'disabled'}>${d}</button>`; }
      const prevOk = new Date(y,mo,1) > new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const slots = S.dia ? horas(S.dia) : [];
      return `${head()}<div class="wrap fade"><span class="lbl">Etapa 3 de 4</span><h2 class="q">Qual o melhor dia e horário?</h2><p class="lbl dim" style="margin:-8px 0 18px">${S.svc.map(id=>svc(id).nome).join(' + ')} com ${pro(S.pro).nome}</p>
        <div class="cal"><div class="mo"><button class="nb" data-mes="-1" ${prevOk?'':'disabled'} aria-label="Mês anterior">${I.left}</button><b>${I.cal}${ML[mo][0].toUpperCase()+ML[mo].slice(1)} de ${y}</b><button class="nb" data-mes="1" aria-label="Próximo mês">${I.right}</button></div>
        <div class="wk">${DS.map(d=>`<span>${d}</span>`).join('')}</div><div class="days">${cells}</div><div class="leg">Dias com horários disponíveis</div></div>
        <div class="slots-h">${I.clock}Horários disponíveis</div>
        ${S.dia ? `<p class="slots-d">${DL[S.dia.getDay()]}, ${S.dia.getDate()} de ${ML[S.dia.getMonth()]}</p><div class="slots">${slots.map(h=>`<button data-hora="${h}" class="${S.hora===h?'on':''}">${h}</button>`).join('')}</div>` : `<p class="empty">Selecione um dia no calendário.</p>`}
        </div>${bar(!!S.dia && !!S.hora)}`;
    },
    4: ()=> `${head()}<div class="wrap fade"><div class="sum"><h3>${I.calok}Seu agendamento</h3><div class="k">Serviços</div>${S.svc.map(id=>`<div class="line"><span class="v">${svc(id).nome}</span><span>${brl(svc(id).preco)}</span></div>`).join('')}
        <div class="g2"><div><div class="k">Duração estimada</div><div class="v">${durEst()}</div></div><div><div class="k">Membro da equipe</div><div class="v">${pro(S.pro).nome}</div></div>
        <div><div class="k">Dia</div><div class="v">${DL[S.dia.getDay()]}, ${S.dia.getDate()} de ${ML[S.dia.getMonth()]}</div></div><div><div class="k">Horário</div><div class="v">${S.hora}</div></div></div>
        <div class="tot"><span class="k">Total</span><b>${brl(total())}</b></div></div>
      <div class="sep"></div>
      <span class="lbl">Etapa 4 de 4</span><h2 class="q">Confira e confirme</h2>
      <div class="fld" id="fNome"><label for="nome">${I.user}Nome</label><input class="inp" id="nome" value="${S.nome}" autocomplete="name"><div class="err">Informe seu nome.</div></div>
      <div class="fld"><label for="email">${I.mail}E-mail (opcional)</label><input class="inp" id="email" type="email" value="${S.email}" autocomplete="email"></div>
      <div class="fld" id="fTel"><label>Telefone</label><div class="ccode"><label><input type="radio" name="ddi" value="+55" ${S.ddi==='+55'?'checked':''}> <svg viewBox="0 0 28 20" width="20" height="14" aria-hidden="true"><rect width="28" height="20" rx="2" fill="#009b3a"/><path fill="#ffdf00" d="M14 3 25 10 14 17 3 10z"/><circle cx="14" cy="10" r="4.2" fill="#002776"/></svg> +55</label><label><input type="radio" name="ddi" value="+1" ${S.ddi==='+1'?'checked':''}> <svg viewBox="0 0 28 20" width="20" height="14" aria-hidden="true"><rect width="28" height="20" rx="2" fill="#fff"/><path stroke="#b22234" stroke-width="2" d="M0 2h28M0 6h28M0 10h28M0 14h28M0 18h28"/><rect width="12" height="10" fill="#3c3b6e"/></svg> +1</label></div>
        <div class="tel"><span class="pre"><svg viewBox="0 0 28 20" width="18" height="13" aria-hidden="true"><rect width="28" height="20" rx="2" fill="#009b3a"/><path fill="#ffdf00" d="M14 3 25 10 14 17 3 10z"/><circle cx="14" cy="10" r="4.2" fill="#002776"/></svg> <span class="dd">${S.ddi}</span></span><input class="inp" id="tel" inputmode="tel" placeholder="(00) 00000-0000" value="${S.tel}" autocomplete="tel"></div><div class="err">Informe um telefone válido.</div></div>
      <div class="fld"><label for="obs">Observações (opcional)</label><textarea class="inp" id="obs">${S.obs}</textarea></div>
      <label class="chk"><input type="checkbox" id="com" ${S.com?'checked':''}> Aceito receber comunicações</label>
      <label class="chk"><input type="checkbox" id="aceite" ${S.aceite?'checked':''}> <span>Li e aceito os <a href="https://azeugral.github.io/khrono-front/cliente/termos.html" target="_blank" rel="noopener">Termos de agendamento e o Aviso de privacidade</a>.</span></label>
      <div class="sep"></div><div class="pol"><h4>Política de cancelamento</h4><p>${B.politica}</p></div>
      </div>${bar(S.nome.trim().length>1 && S.tel.replace(/\D/g,'').length>=10 && S.aceite, 'Confirmar agendamento', I.check)}`,
    ok: ()=> `${head().replace('class="steps"','class="steps" style="display:none"')}<div class="wrap done fade"><div class="ring">${I.check}</div><h2>Tudo certo!</h2><p class="sub">Agendamento solicitado com sucesso. ${S.email?'Enviamos a confirmação para '+S.email+'.':'Você receberá a confirmação no contato informado.'}</p>
      <div class="card"><div class="k">Serviços</div><div class="v">${S.svc.map(id=>svc(id).nome).join(' + ')}</div><div class="k">Membro da equipe</div><div class="v">${pro(S.pro).nome}</div><div class="k">Dia e horário</div><div class="v">${DL[S.dia.getDay()]}, ${S.dia.getDate()} de ${ML[S.dia.getMonth()]} · ${S.hora}</div><div class="k">Total</div><div class="v">${brl(total())}</div></div>
      <button class="btn acc" data-go="start">Agendar novo horário ${I.right}</button><button class="btn" data-go="wel">Meus agendamentos</button></div>
      <div class="powered"><span>Agenda por</span><img src="../assets/img/brand/horizontal-light.svg" alt="Khrono"></div>`,
  };
  const app = $('#app');
  const paint = ()=>{ app.innerHTML = (S.tela === 'wel' ? T.wel : S.tela === 'ok' ? T.ok : T[S.passo])(); scrollTo({ top:0, behavior:'instant' }); };
  const can = ()=> [null, S.svc.length>0, !!S.pro, !!S.dia && !!S.hora, S.nome.trim().length>1 && S.tel.replace(/\D/g,'').length>=10 && S.aceite][S.passo];
  const refresh = ()=>{ const n = $('#next'); if(n) n.disabled = !can(); };

  app.addEventListener('click', e=>{
    const t = e.target, q = s => t.closest(s); let x;
    if(x = q('[data-go]')){ const g = x.dataset.go; if(g === 'google'){ alert('Nesta demonstração o login com Google está desligado. Continue sem login.'); return; } if(g === 'wel'){ S.tela = 'wel'; paint(); return; } Object.assign(S, { tela:'fluxo', passo:1, svc:[], pro:null, dia:null, hora:null, mes:new Date(hoje.getFullYear(), hoje.getMonth(), 1) }); paint(); return; }
    if(x = q('[data-svc]')){ const id = x.dataset.svc; S.svc = S.svc.includes(id) ? S.svc.filter(i=>i!==id) : [...S.svc, id]; x.classList.toggle('on'); refresh(); return; }
    if(x = q('[data-pro]')){ S.pro = x.dataset.pro; $$('[data-pro]').forEach(b=> b.classList.toggle('on', b === x)); refresh(); return; }
    if(x = q('[data-mes]')){ S.mes = new Date(S.mes.getFullYear(), S.mes.getMonth() + (+x.dataset.mes), 1); paint(); return; }
    if(x = q('[data-dia]')){ const [y,m,d] = x.dataset.dia.split('-').map(Number); S.dia = new Date(y, m-1, d); S.hora = null; paint(); const el = $('.slots-h'); if(el) el.scrollIntoView({ behavior:'smooth', block:'start' }); return; }
    if(x = q('[data-hora]')){ S.hora = x.dataset.hora; $$('[data-hora]').forEach(b=> b.classList.toggle('on', b === x)); refresh(); return; }
    if(q('[data-back]')){ if(S.passo === 1){ S.tela = 'wel'; } else S.passo--; paint(); return; }
    if(q('#next')){ if(!can()) return; if(S.passo === 4){ S.tela = 'ok'; paint(); return; } S.passo++; paint(); return; }
  });
  app.addEventListener('input', e=>{
    const t = e.target;
    if(t.id === 'nome'){ S.nome = t.value; $('#fNome').classList.toggle('bad', S.nome.trim().length < 2 && S.nome.length > 0); }
    if(t.id === 'email') S.email = t.value;
    if(t.id === 'tel'){ let v = t.value.replace(/\D/g,'').slice(0, 11); if(S.ddi === '+55'){ if(v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`; else if(v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`; } t.value = v; S.tel = v; }
    if(t.id === 'obs') S.obs = t.value;
    refresh();
  });
  app.addEventListener('change', e=>{
    const t = e.target;
    if(t.name === 'ddi'){ S.ddi = t.value; $('.tel .dd').textContent = S.ddi; }
    if(t.id === 'com') S.com = t.checked;
    if(t.id === 'aceite') S.aceite = t.checked;
    refresh();
  });
  // tema: claro é o padrão; o botão alterna e lembra a escolha
  try{ const th = localStorage.getItem('kh-theme'); if(th) document.documentElement.dataset.theme = th; }catch(e){}
  $('#theme').addEventListener('click', ()=>{ const r = document.documentElement, next = r.dataset.theme === 'dark' ? 'light' : 'dark'; r.dataset.theme = next; try{ localStorage.setItem('kh-theme', next); }catch(e){} });
  $('.tb.lang').addEventListener('click', ()=> alert('Versão em inglês disponível no produto final.'));
  // atalho de teste: ?passo=1..4|ok abre direto naquela etapa com dados preenchidos
  const qp = new URLSearchParams(location.search).get('passo');
  if(qp){ const d = new Date(hoje); d.setDate(d.getDate() + (d.getDay()===6 ? 2 : 1)); Object.assign(S, { tela: qp==='ok' ? 'ok' : 'fluxo', passo: qp==='ok' ? 4 : +qp, svc:['s1'], pro:'p1', mes:new Date(d.getFullYear(), d.getMonth(), 1), dia:d, hora:'10:00', nome:'Maria Oliveira', tel:'(11) 98888-7777', aceite:true }); }
  paint();
})();
