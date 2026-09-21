/* ============================================================
   Khrono — interações do site
   Sem dependências. Cada bloco só roda se o elemento existir.
   ============================================================ */
(function(){
  const $  = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>[...(c||document).querySelectorAll(s)];

  /* ---------- toast ---------- */
  function say(msg){
    let root = $('#toast');
    if(!root){ root = document.createElement('div'); root.id = 'toast'; document.body.appendChild(root); }
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    root.appendChild(el);
    setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(), 200); }, 2400);
  }
  window.say = say;
  const EN = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  const T = (pt, en)=> EN ? en : pt;

  /* ---------- página atual no menu ---------- */
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a, .mnav a, .ftr a').forEach(a=>{
    const href = (a.getAttribute('href')||'').split('#')[0];
    if(href && href === here) a.setAttribute('aria-current','page');
  });

  /* ---------- menus suspensos ---------- */
  $$('.nav li.has').forEach(li=>{
    const b = $('button', li);
    b.setAttribute('aria-expanded','false');
    b.addEventListener('click', e=>{
      e.stopPropagation();
      const open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
      $$('.nav li.has').forEach(o=>{ if(o!==li){ o.classList.remove('open'); $('button',o).setAttribute('aria-expanded','false'); } });
    });
  });
  document.addEventListener('click', ()=> $$('.nav li.has.open').forEach(li=>{ li.classList.remove('open'); $('button',li).setAttribute('aria-expanded','false'); }));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ $$('.nav li.has.open').forEach(li=>li.classList.remove('open')); document.body.classList.remove('menu-open'); } });

  /* ---------- menu mobile ---------- */
  const burger = $('.burger');
  if(burger){
    burger.addEventListener('click', ()=>{
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.mnav a').forEach(a=> a.addEventListener('click', ()=>{ document.body.classList.remove('menu-open'); document.body.style.overflow=''; }));
  }

  /* ---------- botões de apresentação ---------- */
  document.addEventListener('click', e=>{
    const t = e.target.closest('[data-say]');
    if(t){ e.preventDefault(); say(t.dataset.say); }
  });

  /* ---------- tema claro / escuro ---------- */
  $$('.tbtn').forEach(b=> b.addEventListener('click', ()=>{
    const root = document.documentElement;
    const sys = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const cur = root.dataset.theme || sys;
    const next = cur === 'dark' ? 'light' : 'dark';
    const apply = ()=>{ root.dataset.theme = next; try{ localStorage.setItem('theme', next); }catch(e){} };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(document.startViewTransition && !reduce){
      root.classList.add('theming');
      const vt = document.startViewTransition(apply);
      vt.finished.finally(()=> root.classList.remove('theming'));
    } else apply();
  }));

  /* ---------- depoimentos: ver mais ---------- */
  const more = $('#moreQuotes');
  if(more){
    more.addEventListener('click', ()=>{
      $$('.q.hide').forEach(q=>q.classList.remove('hide'));
      more.remove();
    });
  }

  /* ---------- preços: mensal / anual ---------- */
  const tg = $('.toggle');
  if(tg){
    const set = anual =>{
      $$('.toggle button').forEach(b=> b.setAttribute('aria-pressed', String((b.dataset.per==='anual') === anual)));
      $$('[data-mensal]').forEach(el=>{
        const v = anual ? Math.round(+el.dataset.mensal * 0.8) : +el.dataset.mensal;
        el.innerHTML = `<small>R$</small>${v}`;
      });
      $$('[data-was]').forEach(el=>{
        const v = anual ? Math.round(+el.dataset.was * 0.8) : +el.dataset.was;
        el.querySelector('s').textContent = 'R$ ' + v;
      });
      $$('.per').forEach(el=> el.textContent = anual ? T('/mês, no plano anual', '/month, billed yearly') : T('/mês', '/month'));
    };
    $$('.toggle button').forEach(b=> b.addEventListener('click', ()=> set(b.dataset.per==='anual')));
    set(false);
  }

  /* ---------- logo-home: se já estiver no início, só sobe a página ---------- */
  $$('a.logo').forEach(a=>{
    a.addEventListener('click', e=>{
      const here = location.pathname.replace(/index\.html$/, ''), there = new URL(a.href).pathname.replace(/index\.html$/, '');
      if(here === there){ e.preventDefault(); scrollTo({ top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
    });
  });

  /* ---------- abas de visualização (painel / cliente / equipe) ---------- */
  $$('[data-tabs]').forEach(box=>{
    const tabs = $$('[role="tab"]', box), ind = $('.ind', box), views = $$('.view', box);
    const place = (b)=>{ if(!ind) return; ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; };
    const go = (b)=>{ tabs.forEach(t=> t.setAttribute('aria-selected', String(t===b))); views.forEach(v=> v.classList.toggle('on', v.dataset.view === b.dataset.view)); place(b); };
    tabs.forEach(b=> b.addEventListener('click', ()=> go(b)));
    const fromHash = tabs.find(t=> '#'+t.dataset.view === location.hash);
    if(fromHash) go(fromHash); else place(tabs.find(t=> t.getAttribute('aria-selected')==='true') || tabs[0]);
    addEventListener('resize', ()=> place(tabs.find(t=> t.getAttribute('aria-selected')==='true') || tabs[0]));
  });

  /* ---------- planos: mensal ↔ anual (preço/mês muda, anual mostra o total e a economia) ---------- */
  $$('[data-plans]').forEach(box=>{
    const tabs = $$('[role="tab"]', box), ind = $('.ind', box);
    const place = (b)=>{ if(ind){ ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; } };
    const go = (b)=>{
      const annual = b.dataset.cycle === 'a';
      tabs.forEach(t=> t.setAttribute('aria-selected', String(t===b)));
      box.classList.toggle('annual', annual);
      const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      $$('.price .n', box).forEach(n=>{
        const v = annual ? n.dataset.a : n.dataset.m; if(n.textContent === v) return;
        n.getAnimations().forEach(a=> a.cancel());
        if(rm || !n.animate){ n.textContent = v; return; }
        clearTimeout(n._t);
        const out = n.animate([{ opacity:1, transform:'none', filter:'blur(0)' }, { opacity:0, transform:'translateY(-10px)', filter:'blur(2px)' }], { duration:150, easing:'cubic-bezier(.4,0,1,1)', fill:'forwards' });
        n._t = setTimeout(()=>{
          out.cancel(); n.textContent = v;
          n.animate([{ opacity:0, transform:'translateY(12px)', filter:'blur(2px)' }, { opacity:1, transform:'none', filter:'blur(0)' }], { duration:460, easing:'cubic-bezier(.32,.72,0,1)' });
        }, 150);
      });
      place(b);
    };
    tabs.forEach(b=> b.addEventListener('click', ()=> go(b)));
    place(tabs.find(t=> t.getAttribute('aria-selected')==='true') || tabs[0]);
    addEventListener('resize', ()=> place(tabs.find(t=> t.getAttribute('aria-selected')==='true') || tabs[0]));
  });

  /* ---------- formulários (sem back-end: valida e confirma) ---------- */
  $$('form[data-demo]').forEach(f=>{
    f.setAttribute('novalidate','');
    f.addEventListener('submit', e=>{
      e.preventDefault();
      let ok = true;
      $$('.fld', f).forEach(fld=>{
        const acc = $('[data-accept]', fld);
        if(acc){ const bad = !acc.checked; fld.classList.toggle('bad', bad); if(bad) ok = false; return; }
        const inp = $('.inp', fld);
        if(!inp) return;
        const need = inp.hasAttribute('required');
        let bad = need && !inp.value.trim();
        if(!bad && inp.type === 'email' && inp.value && !/^\S+@\S+\.\S+$/.test(inp.value)) bad = true;
        if(!bad && inp.dataset.tel && inp.value.replace(/\D/g,'').length < 10) bad = true;
        fld.classList.toggle('bad', bad);
        inp.classList.toggle('err', bad);
        if(bad) ok = false;
      });
      if(!ok){ say(T('Confira os campos destacados', 'Check the highlighted fields')); return; }
      if(f.dataset.demo === 'login'){ say(T('O login abre junto com o cadastro', 'Sign-in opens together with sign-up')); return; }
      const nome = ($('[name="nome"]', f) || {}).value || '';
      if(f.dataset.demo === 'conta'){
        f.innerHTML = `
        <div class="okbox">
          <div class="ring"><svg viewBox="0 0 24 24"><path d="M20 6.5L9.4 17.1 4 11.7"/></svg></div>
          <h3>${T('Conta criada', 'Account created')}${nome ? ', ' + nome.split(' ')[0] : ''}.</h3>
          <p>${T('Sete dias grátis a partir de agora. Nesta demonstração o painel ainda não está ligado — é o próximo passo do projeto.', 'Seven free days start now. In this demo the dashboard is not wired up yet — that is the next step of the project.')}</p>
        </div>`;
      } else {
        f.innerHTML = `
        <div class="okbox">
          <div class="ring"><svg viewBox="0 0 24 24"><path d="M20 6.5L9.4 17.1 4 11.7"/></svg></div>
          <h3>${T('Você está na lista', "You're on the list")}${nome ? ', ' + nome.split(' ')[0] : ''}.</h3>
          <p>${T('Um e-mail quando o cadastro abrir, com o preço de lançamento garantido. Nenhum outro.', 'One e-mail when sign-up opens, with the launch price locked in. No other.')}</p>
        </div>`;
      }
      f.scrollIntoView({ behavior:'smooth', block:'center' });
    });
    $$('.inp', f).forEach(inp=> inp.addEventListener('input', ()=>{ inp.classList.remove('err'); inp.closest('.fld')?.classList.remove('bad'); }));
  });

  /* ---------- máscara leve de telefone ---------- */
  $$('input[data-tel]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      let v = inp.value.replace(/\D/g,'').slice(0,11);
      if(v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      else if(v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      inp.value = v;
    });
  });
})();
