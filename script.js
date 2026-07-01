/* =========================================================
   INSANYS — interações & efeitos cósmicos
   ========================================================= */
(function(){
  "use strict";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Ano no footer
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Voltar ao topo
  --------------------------------------------------------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const toggleVisibility = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     Pausa animações de canvas quando a aba não está visível
     (economiza CPU/bateria em segundo plano)
  --------------------------------------------------------- */
  let tabHidden = false;
  document.addEventListener('visibilitychange', () => {
    tabHidden = document.hidden;
  });

  /* ---------------------------------------------------------
     Menu mobile
  --------------------------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.site-nav nav');
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------
     Cursor glow (segue o mouse)
  --------------------------------------------------------- */
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && !reduceMotion && matchMedia('(hover:hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    }, { passive: true });
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  /* ---------------------------------------------------------
     Reveal on scroll — fade/rise para seções e cards
  --------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.visual-card, .fragment-piece, .grimoire, .system-grid, .domain-header, .manifesto-text, .convocar-inner'
  );

  if ('IntersectionObserver' in window && !reduceMotion) {
    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .8s ease, transform .8s ease';
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     STARFIELD — campo de estrelas com leve parallax
  --------------------------------------------------------- */
  const starCanvas = document.getElementById('starfield');
  if (starCanvas) {
    const ctx = starCanvas.getContext('2d');
    let stars = [];
    let w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = document.documentElement.scrollHeight;
      starCanvas.width = w * dpr;
      starCanvas.height = h * dpr;
      starCanvas.style.width = w + 'px';
      starCanvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function buildStars() {
      const count = Math.floor((w * h) / 9000);
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.015 + 0.004,
        dir: Math.random() > 0.5 ? 1 : -1,
        hue: Math.random() > 0.85 ? 'gold' : (Math.random() > 0.7 ? 'purple' : 'white')
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.a += s.tw * s.dir;
        if (s.a > 0.85 || s.a < 0.15) s.dir *= -1;

        let color;
        if (s.hue === 'gold') color = `rgba(212,175,55,${s.a})`;
        else if (s.hue === 'purple') color = `rgba(167,139,250,${s.a})`;
        else color = `rgba(245,240,232,${s.a})`;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion && !tabHidden) requestAnimationFrame(draw);
      else if (!reduceMotion && tabHidden) setTimeout(() => requestAnimationFrame(draw), 400);
    }

    resize();
    draw();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
  }

  /* ---------------------------------------------------------
     BLACK HOLE — disco de acreção animado no hero
  --------------------------------------------------------- */
  const bhCanvas = document.getElementById('blackhole');
  if (bhCanvas) {
    const ctx = bhCanvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = 0;
    let particles = [];
    let t = 0;

    function setSize() {
      const rect = bhCanvas.getBoundingClientRect();
      size = rect.width;
      bhCanvas.width = size * dpr;
      bhCanvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function buildParticles() {
      const count = 260;
      particles = new Array(count).fill(0).map(() => {
        const radius = size * (0.16 + Math.random() * 0.34);
        return {
          angle: Math.random() * Math.PI * 2,
          radius,
          baseRadius: radius,
          speed: (0.0014 + Math.random() * 0.0022) * (radius < size * 0.25 ? 1.6 : 1),
          size: Math.random() * 1.8 + 0.4,
          colorMix: Math.random()
        };
      });
    }

    function colorForParticle(p) {
      // mistura dourado -> roxo -> vermelho dependendo da posição/raio
      if (p.colorMix < 0.4) return `rgba(212,175,55,OPA)`;     // dourado
      if (p.colorMix < 0.75) return `rgba(124,58,237,OPA)`;    // roxo
      return `rgba(196,30,58,OPA)`;                              // vermelho
    }

    function draw() {
      t += 1;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // halo externo suave
      const haloGrad = ctx.createRadialGradient(cx, cy, size * 0.10, cx, cy, size * 0.5);
      haloGrad.addColorStop(0, 'rgba(124,58,237,0.18)');
      haloGrad.addColorStop(0.5, 'rgba(124,58,237,0.05)');
      haloGrad.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // disco de acreção: partículas orbitando, achatadas verticalmente
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.42); // achata pra parecer disco visto de lado

      for (const p of particles) {
        p.angle += p.speed;
        // leve pulsação de raio para sensação orgânica
        const wobble = Math.sin(t * 0.01 + p.angle * 3) * size * 0.004;
        const r = p.baseRadius + wobble;
        const x = Math.cos(p.angle) * r;
        const y = Math.sin(p.angle) * r;

        // opacidade maior na "frente" (y positivo simulando profundidade)
        const depthOpacity = 0.35 + (Math.sin(p.angle) * 0.5 + 0.5) * 0.5;
        const color = colorForParticle(p).replace('OPA', depthOpacity.toFixed(2));

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // núcleo: o "evento" — preto absoluto com borda dourada/roxa pulsante
      const coreR = size * 0.13;
      const pulse = Math.sin(t * 0.02) * 0.5 + 0.5;

      const ringGrad = ctx.createRadialGradient(cx, cy, coreR * 0.7, cx, cy, coreR * 1.35);
      ringGrad.addColorStop(0, `rgba(212,175,55,${0.55 + pulse * 0.25})`);
      ringGrad.addColorStop(0.5, `rgba(124,58,237,${0.4 + pulse * 0.2})`);
      ringGrad.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 1.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#020103';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) {
        if (!tabHidden) requestAnimationFrame(draw);
        else setTimeout(() => requestAnimationFrame(draw), 400);
      }
    }

    setSize();
    draw();

    let resizeTimer2;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer2);
      resizeTimer2 = setTimeout(setSize, 200);
    });

    if (reduceMotion) {
      // desenha um único frame estático
      draw();
    }
  }

  /* ---------------------------------------------------------
     Nav: fundo sólido após scroll
  --------------------------------------------------------- */
  const siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        siteNav.style.background = 'rgba(5,3,10,0.92)';
        siteNav.style.boxShadow = '0 1px 0 rgba(212,175,55,0.12)';
      } else {
        siteNav.style.background = 'linear-gradient(to bottom, rgba(5,3,10,0.85), transparent)';
        siteNav.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------
     Grimório — accordion dos três pilares (Sistemas, Mestragem,
     Worldbuilding). Apenas um painel aberto por vez; clicar no
     já aberto fecha tudo.
  --------------------------------------------------------- */
  const grimoire = document.getElementById('grimoire');
  if (grimoire) {
    const entries = Array.from(grimoire.querySelectorAll('.grimoire-entry'));

    function setEntryOpen(entry, open) {
      const btn = entry.querySelector('.grimoire-btn');
      entry.dataset.open = open ? 'true' : 'false';
      btn.setAttribute('aria-expanded', String(open));
    }

    entries.forEach(entry => {
      const btn = entry.querySelector('.grimoire-btn');
      btn.addEventListener('click', () => {
        const isOpen = entry.dataset.open === 'true';
        entries.forEach(other => {
          if (other !== entry) setEntryOpen(other, false);
        });
        setEntryOpen(entry, !isOpen);
      });
    });
  }

})();