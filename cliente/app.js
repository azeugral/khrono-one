/* Página do cliente — réplica do fluxo /b/<slug> do Khrono com dados de demonstração.
   Boas-vindas → 1 Serviços → 2 Membro da equipe → 3 Dia e horário → 4 Revisão → Tudo certo. Tudo em memória, sem back-end. */
(function(){
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  /* nicho define capa, ícone e cor de destaque — nada disso vem de upload, é fixo por tipo de negócio */
  const NICHOS = {
    barbearia: { rotulo:'Barbearia', capa:'../assets/img/hero-barbearia.jpg', tinta:'#1f4a3a', frase:'Cadeira reservada no seu nome. Escolha o horário e apareça.',
      icone:'<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M8 7.6L20 18M8 16.4L20 6"/></svg>' },
    salao: { rotulo:'Salão de beleza', capa:'../assets/img/hero-salao.jpg', tinta:'#4a2f3f', frase:'Um tempo só seu. Escolha o serviço e o horário que combina com o seu dia.',
      icone:'<svg viewBox="0 0 24 24"><path d="M7 21V10a5 5 0 0 1 10 0v11M9 21v-6h6v6M12 5V3"/><circle cx="12" cy="7" r="1.2"/></svg>' },
    clinica: { rotulo:'Clínica de estética', capa:'../assets/img/hero-clinica.jpg', tinta:'#1d4f52', frase:'Cuidado com hora marcada. Escolha o procedimento e reserve o seu horário.',
      icone:'<svg viewBox="0 0 24 24"><path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z"/><path d="M12 21V8M12 12c-2 0-3.4-1.2-3.8-3M12 15c2 0 3.4-1.2 3.8-3"/></svg>' },
  };
  const qs = new URLSearchParams(location.search);
  const NICHO = NICHOS[qs.get('nicho')] ? qs.get('nicho') : 'barbearia';
  const N = NICHOS[NICHO];
  const B = {
    nome:{ barbearia:'Barbearia Dan', salao:'Studio Aurora', clinica:'Clínica Lumière' }[NICHO],
    ini:{ barbearia:'BD', salao:'SA', clinica:'CL' }[NICHO],
    tel:'(19) 98442-8872', telLink:'+5519984428872',
    endereco:{ barbearia:'Centro, Campinas', salao:'Pinheiros, São Paulo', clinica:'Moema, São Paulo' }[NICHO],
    abre:'09:00', fecha:'20:00', nota:'4,9', avaliacoes:287,
    capa:N.capa, icone:N.icone, tagline:N.frase, rotulo:N.rotulo,
    politica:'Cancelamentos e remarcações devem ser feitos com pelo menos 12 horas de antecedência. Atrasos acima de 10 minutos podem reduzir o tempo do atendimento.',
    servicos:{
      barbearia:[ { id:'s1', nome:'Corte masculino', desc:'Máquina, tesoura e finalização', min:30, max:45, preco:55 },
        { id:'s2', nome:'Corte + barba', desc:'O combo completo, com toalha quente', min:50, max:70, preco:85 },
        { id:'s3', nome:'Barba modelada', desc:'Navalha, toalha quente e hidratação', min:25, max:35, preco:45 },
        { id:'s4', nome:'Pezinho', desc:'Acabamento entre um corte e outro', min:15, max:20, preco:25 } ],
      salao:[ { id:'s1', nome:'Corte feminino', desc:'Lavagem, corte e finalização', min:45, max:60, preco:80 },
        { id:'s2', nome:'Escova modelada', desc:'Escova com finalização a seu gosto', min:30, max:45, preco:60 },
        { id:'s3', nome:'Coloração', desc:'Cor, tonalização e tratamento', min:90, max:120, preco:180 },
        { id:'s4', nome:'Design de sobrancelhas', desc:'Modelagem com pinça e acabamento', min:20, max:30, preco:45 } ],
      clinica:[ { id:'s1', nome:'Limpeza de pele', desc:'Higienização, extração e máscara', min:60, max:75, preco:150 },
        { id:'s2', nome:'Peeling de diamante', desc:'Renovação celular com ponteira', min:45, max:60, preco:220 },
        { id:'s3', nome:'Drenagem linfática', desc:'Manobras para retenção e inchaço', min:50, max:60, preco:190 },
        { id:'s4', nome:'Massagem relaxante', desc:'Pressão média, óleos quentes', min:50, max:60, preco:160 } ],
    }[NICHO],
    equipe:{
      barbearia:[ { id:'p1', nome:'Dan Oliveira', ini:'DO' }, { id:'p2', nome:'Rafa Souza', ini:'RS' }, { id:'p3', nome:'Léo Prado', ini:'LP' } ],
      salao:[ { id:'p1', nome:'Ana Ribeiro', ini:'AR' }, { id:'p2', nome:'Bruno Costa', ini:'BC' }, { id:'p3', nome:'Camila Duarte', ini:'CD' } ],
      clinica:[ { id:'p1', nome:'Marina Lopes', ini:'ML' }, { id:'p2', nome:'Helena Gil', ini:'HG' }, { id:'p3', nome:'Paula Nunes', ini:'PN' } ],
    }[NICHO],
  };
  document.documentElement.dataset.nicho = NICHO;
  document.title = B.nome + ' — Agendamento online · Khrono';
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
    phone:'<svg viewBox="0 0 24 24"><path d="M6.6 3h3l1.5 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.5v3A2 2 0 0 1 18 18.4 15.6 15.6 0 0 1 5.6 6 2 2 0 0 1 6.6 3z"/></svg>',
    pin:'<svg viewBox="0 0 24 24"><path d="M12 21c-4-3.6-7-6.8-7-10a7 7 0 0 1 14 0c0 3.2-3 6.4-7 10z"/><circle cx="12" cy="11" r="2.6"/></svg>',
    star:'<svg viewBox="0 0 24 24"><path d="M12 3.4l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.2 6.9 18.8l1-5.6L3.9 9.3l5.6-.7z"/></svg>',
    zap:'<svg viewBox="0 0 24 24"><path d="M13 3L5 13h6l-1 8 8-10h-6z"/></svg>',
    shield:'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9.2 12.2l2 2 3.6-3.8"/></svg>',
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
    wel: ()=>{
      const agora = new Date(), h = agora.getHours() + agora.getMinutes()/60;
      const aberto = h >= +B.abre.slice(0,2) && h < +B.fecha.slice(0,2) && agora.getDay() !== 0;
      const saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
      return `<header class="cover">
        <img class="bg" src="${B.capa}" alt="" fetchpriority="high">
        <span class="veil"></span><span class="grain"></span><span class="ring"></span>
        <div class="cIn">
          <span class="mark">${B.icone}</span>
          <span class="kicker">${B.rotulo} · Agendamento online</span>
          <h1>${B.nome}</h1>
          <p class="tag">${saud}. ${B.tagline}</p>
          <div class="chips">
            <span class="chip st ${aberto ? 'on' : 'off'}"><i></i>${aberto ? `Aberto agora · até ${B.fecha}` : `Fechado · abre ${B.abre}`}</span>
            <a class="chip" href="tel:${B.telLink}">${I.phone}${B.tel}</a>
            <span class="chip">${I.pin}${B.endereco}</span>
            <span class="chip">${I.star}${B.nota} <small>(${B.avaliacoes})</small></span>
          </div>
        </div>
      </header>
      <section class="welcome fade">
        <div class="wHead"><span class="eyebrow">Boas-vindas</span><h2>Vamos marcar seu horário?</h2><p class="sub">Escolha o serviço, o profissional e o horário. Leva menos de um minuto.</p></div>
        <button class="btn acc lg" data-go="start">Escolher horário ${I.right}</button>
        <ul class="perks">
          <li>${I.zap}<span><b>Sem cadastro</b>você só informa nome e contato no fim</span></li>
          <li>${I.shield}<span><b>Confirmação na hora</b>com lembrete antes do atendimento</span></li>
          <li>${I.gift}<span><b>Fidelidade</b>entre na conta e acompanhe seus pontos</span></li>
        </ul>
        <div class="sep2"><span>já é cliente?</span></div>
        <button class="btn ghost" data-go="google">${I.login} Entrar com Google</button>
        <p class="fine2">Ao continuar você aceita os <a href="https://azeugral.github.io/khrono-front/cliente/termos.html" target="_blank" rel="noopener">Termos de agendamento</a> de ${B.nome}.</p>
      </section>
      <div class="powered"><span>Agenda por</span><img src="../assets/img/brand/horizontal-light.svg" alt="Khrono"></div>`;
    },
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
  const paint = ()=>{ app.innerHTML = (S.tela === 'wel' ? T.wel : S.tela === 'ok' ? T.ok : T[S.passo])(); document.body.classList.toggle('welcome-on', S.tela === 'wel'); scrollTo({ top:0, behavior:'instant' }); };
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
