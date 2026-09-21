/* ============================================================
   Khrono — movimento: transições, revelação, contadores
   Carregado depois de site.js. Tudo degrada para estático.
   ============================================================ */
(function(){
  const $  = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>[...(c||document).querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => 1 - Math.pow(1 - t, 3);

  root.classList.add('js');

  /* ---------- transição entre páginas ---------- */
  const crossDocVT = 'onpagereveal' in window;          // View Transitions entre documentos
  if(crossDocVT) root.classList.add('vt');
  if(!crossDocVT && !reduce){
    document.addEventListener('click', e=>{
      const a = e.target.closest('a[href]');
      if(!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if(a.target === '_blank' || a.hasAttribute('download') || a.origin !== location.origin) return;
      const href = a.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if(a.pathname === location.pathname && a.hash) return;
      e.preventDefault();
      root.classList.add('leaving');
      setTimeout(()=>{ location.href = a.href; }, 200);
    });
  }
  window.addEventListener('pageshow', ()=> root.classList.remove('leaving'));

  /* ---------- cabeçalho ao rolar ---------- */
  const hdr = $('.hdr');
  if(hdr){
    let last = -1;
    const onScroll = ()=>{
      const s = scrollY > 12;
      if(s !== last){ hdr.classList.toggle('scrolled', s); last = s; }
    };
    addEventListener('scroll', onScroll, { passive:true }); onScroll();
  }

  /* ---------- índices para escalonar filhos ---------- */
  const k = (sel)=> $$(sel).forEach((el,i)=> el.style.setProperty('--k', i));
  k('.shot .ev'); k('.stat .chart i'); k('.flow .st'); k('.chat > *'); k('.hub .n');
  k('.bars i'); k('.rrow'); $$('.cc ul').forEach(ul=> [...ul.children].forEach((li,i)=> li.style.setProperty('--k', i)));

  /* ---------- revelação na rolagem ---------- */
  const SEL = [
    '.hero .wrap > *', '.pageHead .wrap > *',
    '.secHead', '.card', '.q:not(.hide)', '.post', '.plan', '.cmp', '.vtabs.bill',
    '.split > .txt', '.split > .vis', '.trust > div', '.feat > div',
    '.numbers .n', '.person', '.faq details', '.form', '.status', '.prose > *',
    '.compare', '.apps > .card', '.chips', '.dash', '.phoneWrap', '.collage .col', '.photo', '.mosaic', '.seg', '.essGrid', '.quote', '.fact', '.one', '.faqs details', '.phones'
  ].join(',');
  const items = $$(SEL).filter(el => !el.closest('.hdr, .ftr, .mnav'));
  // escalona irmãos que revelam juntos
  const groups = new Map();
  items.forEach(el=>{
    const p = el.parentElement;
    const n = groups.get(p) || 0;
    el.style.setProperty('--i', Math.min(n, 8));
    groups.set(p, n + 1);
    el.setAttribute('data-reveal', '');
  });
  /* índice dos filhos que entram escalonados dentro de um bloco revelado */
  $$('.mosaic .tile, .cmp .hd > *, .cmp .rows li, .card.cycle .rw, .essGrid .ess, .facts .fact').forEach(el=> el.style.setProperty('--k', [...el.parentElement.children].indexOf(el)));
  if(reduce || !('IntersectionObserver' in window)){
    items.forEach(el=> el.classList.add('in', 'settled'));
  } else {
    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(!en.isIntersecting) return;
        en.target.classList.add('in');
        setTimeout(()=> en.target.classList.add('settled'), 1800);   // depois da entrada, filhos voltam a reagir sem atraso (hover)
        io.unobserve(en.target);
        if(en.target.matches('.numbers .n, .trust > div')) countUp(en.target);
        $$('[data-count]', en.target).forEach(countEl);
        $$('.spark .line', en.target).forEach(drawLine);
      });
    }, { threshold:.12, rootMargin:'0px 0px -6% 0px' });
    items.forEach(el=> io.observe(el));
  }

  /* ---------- sparklines desenham ao aparecer ---------- */
  function drawLine(path){
    if(path.dataset.drawn || reduce) return;
    path.dataset.drawn = '1';
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = 'none';
    requestAnimationFrame(()=>{
      path.style.transition = 'stroke-dashoffset 1.3s ' + getComputedStyle(root).getPropertyValue('--ease').trim() + ' .25s';
      path.style.strokeDashoffset = '0';
    });
  }

  /* contadores com formatação pt-BR: data-count="74861.62" data-prefix="R$ " data-dec="2" */
  function countEl(el){
    if(el.dataset.counted || reduce) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const final = el.textContent;
    const t0 = performance.now(), dur = 1300;
    const fmt = v => pre + v.toLocaleString('pt-BR', { minimumFractionDigits:dec, maximumFractionDigits:dec }) + suf;
    const step = now=>{
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(target * ease(p));
      if(p < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  }

  /* ---------- cartões flutuantes: leve paralaxe ---------- */
  const ccs = $$('.collage .col');
  if(ccs.length && !reduce && matchMedia('(min-width: 821px)').matches){
    let raf = 0;
    const move = ()=>{
      raf = 0;
      const vh = innerHeight;
      ccs.forEach(c=>{
        const r = c.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;       // distância do centro da tela
        const y = center * parseFloat(c.dataset.speed || 0) * -1;
        c.style.transform = `translateY(${y.toFixed(1)}px)`;
      });
    };
    addEventListener('scroll', ()=>{ if(!raf) raf = requestAnimationFrame(move); }, { passive:true });
    move();
  }
  $$('.phoneWrap .phone').forEach(p=> p.classList.add('float'));

  /* ---------- números que contam ---------- */
  function countUp(box){
    const el = box.querySelector('b, .big');
    if(!el || el.dataset.counted) return;
    el.dataset.counted = '1';
    const node = [...el.childNodes].find(n=> n.nodeType === 3 && n.textContent.trim());
    if(!node) return;
    const raw = node.textContent.trim();
    const m = raw.match(/^([−\-+]?)(\d+)(?:[.,](\d+))?(.*)$/);
    if(!m) return;
    const sign = m[1], intPart = m[2], dec = m[3] || '', suffix = m[4];
    const target = parseFloat(intPart + (dec ? '.' + dec : ''));
    const places = dec.length;
    const t0 = performance.now(), dur = 1100;
    const step = now=>{
      const p = Math.min(1, (now - t0) / dur), v = target * ease(p);
      node.textContent = sign + v.toFixed(places).replace('.', ',') + suffix;
      if(p < 1) requestAnimationFrame(step); else node.textContent = raw;
    };
    requestAnimationFrame(step);
  }

  /* ---------- logos em faixa ---------- */
  const logos = $('.logos');
  if(logos && !reduce){
    const track = document.createElement('div');
    track.className = 'track';
    const kids = [...logos.children];
    kids.forEach(c=> track.appendChild(c));
    kids.forEach(c=> track.appendChild(c.cloneNode(true)));
    logos.appendChild(track);
  }

  /* ---------- FAQ com abertura animada ----------
     <details> fechado não renderiza o conteúdo, então a altura não tem de onde animar. Mantemos open=true
     e guardamos o estado em .on: o grid anima 0fr -> 1fr nos dois sentidos. */
  $$('.faq details, .faqs details').forEach(d=>{
    const a = $('.a', d), s = $('summary', d);
    if(!a || !s) return;
    const w = document.createElement('div'); w.className = 'wrapA';
    d.insertBefore(w, a); w.appendChild(a);
    const on = d.open; d.open = true; d.classList.add('js');
    d.classList.toggle('on', on); s.setAttribute('aria-expanded', String(on));
    s.addEventListener('click', e=>{
      e.preventDefault();
      const next = !d.classList.contains('on');
      d.classList.toggle('on', next); s.setAttribute('aria-expanded', String(next));
    });
  });

  /* ---------- alternância de preços ---------- */
  const tg = $('.toggle');
  if(tg){
    const knob = document.createElement('span'); knob.className = 'knob'; tg.prepend(knob);
    const place = ()=>{
      const b = $('button[aria-pressed="true"]', tg); if(!b) return;
      knob.style.width = b.offsetWidth + 'px';
      knob.style.transform = `translateX(${b.offsetLeft}px)`;
    };
    tg.addEventListener('click', e=>{
      if(!e.target.closest('button')) return;
      $$('.plan .price b').forEach(b=> b.classList.add('swap'));
      setTimeout(()=>{ place(); $$('.plan .price b').forEach(b=> b.classList.remove('swap')); }, 200);
    }, true);
    addEventListener('resize', place);
    if(document.fonts) document.fonts.ready.then(place); else place();
    setTimeout(place, 50);
  }

  /* ---------- depoimentos: ver mais com entrada ---------- */
  const more = $('#moreQuotes');
  if(more){
    more.addEventListener('click', ()=>{
      $$('.q.hide').forEach((q,i)=>{
        q.classList.remove('hide'); q.classList.add('appear');
        requestAnimationFrame(()=> setTimeout(()=> q.classList.remove('appear'), i * 70));
      });
    }, true);
  }
})();
