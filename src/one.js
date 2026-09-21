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

  /* ---------- celulares: carregam a área do cliente real quando a aba abre ---------- */
  const live = $('.phones.live');
  if(live){
    const base = live.dataset.app || '';
    const frames = $$('.scr', live);
    const fit = ()=> frames.forEach(scr=>{
      const f = $('iframe', scr); if(!f) return;
      const s = scr.clientWidth / 390;
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
