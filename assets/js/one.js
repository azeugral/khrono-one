/* khrono-one: scrollspy, menu móvel fechando nas âncoras, agenda revelada e área do cliente real dentro dos celulares */
(function(){
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- menu móvel: âncora clicada fecha o menu ---------- */
  $$('.mnav a[href^="#"]').forEach(a=> a.addEventListener('click', ()=>{ document.body.classList.remove('menu-open'); const b = $('.burger'); if(b) b.setAttribute('aria-expanded', 'false'); }));

  /* ---------- scrollspy: a seção mais visível acende o item do menu ---------- */
  const links = $$('.nav.spy a[href^="#"]');
  const secs = links.map(a=> $(a.getAttribute('href'))).filter(Boolean);
  if(secs.length && 'IntersectionObserver' in window){
    const ratio = new Map();
    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=> ratio.set(en.target, en.isIntersecting ? en.intersectionRatio : 0));
      let best = null, r = .08; ratio.forEach((v, k)=>{ if(v > r){ r = v; best = k; } });
      links.forEach(a=> a.classList.toggle('on', !!best && a.getAttribute('href') === '#' + best.id));
    }, { threshold:[0, .1, .25, .5, .75, 1], rootMargin:'-20% 0px -50% 0px' });
    secs.forEach(s=> io.observe(s));
  }

  /* ---------- agenda: revela os cartões quando entra na tela ---------- */
  const agd = $('.agd');
  if(agd){
    if(reduce || !('IntersectionObserver' in window)) agd.classList.add('in', 'settled');
    else {
      const io = new IntersectionObserver(es=>{ es.forEach(en=>{ if(!en.isIntersecting) return; agd.classList.add('in'); setTimeout(()=> agd.classList.add('settled'), 1800); io.disconnect(); }); }, { threshold:.2 });
      io.observe(agd);
    }
  }

  /* ---------- painel: números que contam, barras que sobem, "atualizar" de tempos em tempos ---------- */
  const pnl = $('.pnl');
  if(pnl){
    const ease = t => 1 - Math.pow(1 - t, 3);
    const fmt = (v, el) => (el.dataset.prefix || '') + v.toLocaleString('pt-BR', { minimumFractionDigits:+(el.dataset.dec||0), maximumFractionDigits:+(el.dataset.dec||0) });
    const count = (el, to, dur=1400) => { const from = parseFloat(el.dataset.cur || 0), t0 = performance.now(); const step = now => { const p = Math.min(1, (now - t0) / dur); const v = from + (to - from) * ease(p); el.textContent = fmt(+(el.dataset.dec ? v.toFixed(2) : Math.round(v)), el); if(p < 1) requestAnimationFrame(step); else el.dataset.cur = to; }; requestAnimationFrame(step); };
    const start = ()=>{
      pnl.classList.add('in'); setTimeout(()=> pnl.classList.add('settled'), 2200);
      $$('.pv', pnl).forEach((el, i)=> setTimeout(()=> count(el, +el.dataset.to), 250 + i * 120));
      if(reduce) return;
      // a cada 9s o painel "atualiza": ícone gira, um dia recebe mais movimento, os números avançam um pouco
      setInterval(()=>{
        pnl.classList.remove('tick'); void pnl.offsetWidth; pnl.classList.add('tick');
        const bars = $$('.pnbars i', pnl), b = bars[Math.floor(Math.random() * 5) + 9];
        const v = Math.min(1, parseFloat(getComputedStyle(b).getPropertyValue('--v')) + .08); b.style.setProperty('--v', v.toFixed(2));
        const [rec, ag, ok] = $$('.pv', pnl);
        count(ag, +ag.dataset.cur + 1, 700); if(Math.random() > .4) count(ok, +ok.dataset.cur + 1, 700); count(rec, +(+rec.dataset.cur + 60 + Math.round(Math.random() * 3) * 20).toFixed(2), 900);
      }, 9000);
    };
    if(reduce || !('IntersectionObserver' in window)){ pnl.classList.add('in', 'settled'); $$('.pv', pnl).forEach(el=>{ el.textContent = fmt(+el.dataset.to, el); el.dataset.cur = el.dataset.to; }); }
    else { const io = new IntersectionObserver(es=>{ es.forEach(en=>{ if(!en.isIntersecting) return; start(); io.disconnect(); }); }, { threshold:.15 }); io.observe(pnl); }
  }

  /* ---------- celulares: carregam a área do cliente real quando a aba abre ---------- */
  const live = $('.phones.live');
  if(live){
    const base = live.dataset.app || '';
    const frames = $$('.scr', live);
    const fit = ()=> frames.forEach(scr=>{
      const f = $('iframe', scr); if(!f) return;
      const s = scr.clientWidth / 390;   // a página do cliente é desenhada a 390px e escalada para a moldura
      f.style.setProperty('--s', s.toFixed(4)); f.style.setProperty('--ih', Math.ceil(scr.clientHeight / s) + 'px');
    });
    let loaded = false;
    const load = ()=>{
      if(loaded) return; loaded = true; fit();
      frames.forEach((scr, i)=>{
        const f = $('iframe', scr);
        const ready = ()=> f.classList.add('ready');
        f.addEventListener('load', ()=> setTimeout(ready, 250 + i * 200));
        setTimeout(ready, 4000 + i * 200);   // rede lenta: mostra mesmo assim
        f.src = base + (f.dataset.src || '');
      });
    };
    const view = live.closest('.view');
    const check = ()=>{ if(view && view.classList.contains('on')) load(); };
    new MutationObserver(check).observe(view, { attributes:true, attributeFilter:['class'] });
    check();
    addEventListener('resize', fit);
  }
})();
