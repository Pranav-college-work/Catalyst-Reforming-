/* FCC study material · shared behaviour: theme, contents, progress, figure zoom, stepper, keys */
(function () {
  const root = document.documentElement;

  /* ---------- theme ---------- */
  function readTheme() { try { return localStorage.getItem('fcc-theme'); } catch (e) { return null; } }
  function saveTheme(t) { try { localStorage.setItem('fcc-theme', t); } catch (e) { /* storage blocked */ } }
  const saved = readTheme();
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;

  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tbtn = document.getElementById('themeBtn');
    const paint = () => {
      if (!tbtn) return;
      const dark = currentTheme() === 'dark';
      tbtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      tbtn.innerHTML = dark
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
    };
    paint();
    if (tbtn) tbtn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next; saveTheme(next); paint();
      document.dispatchEvent(new CustomEvent('themechange'));
    });

    /* ---------- on-this-page contents + scrollspy ---------- */
    const tocList = document.getElementById('tocList');
    const heads = [...document.querySelectorAll('main h2.sh[id]')];
    if (tocList && heads.length) {
      heads.forEach(h => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.dataset.toc || h.textContent.replace(/^\s*\d+\s*/, '').trim();
        li.appendChild(a); tocList.appendChild(li);
      });
      const links = [...tocList.querySelectorAll('a')];
      const setOn = id => links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
      const io = new IntersectionObserver(entries => {
        const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis.length) setOn(vis[0].target.id);
      }, { rootMargin: '-90px 0px -65% 0px' });
      heads.forEach(h => io.observe(h));
    }

    /* ---------- reading progress + back to top ---------- */
    const bar = document.querySelector('.progress');
    const top = document.querySelector('.totop');
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
      if (top) top.classList.toggle('show', scrollY > 700);
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (top) top.addEventListener('click', () => scrollTo({ top: 0 }));

    /* ---------- figure lightbox ---------- */
    const lb = document.getElementById('lb');
    if (lb) {
      const img = lb.querySelector('img');
      const title = lb.querySelector('.ti');
      const open = lb.querySelector('a.open');
      let w = 96;
      const setW = v => { w = Math.max(60, Math.min(300, v)); img.style.width = w + '%'; };
      const show = fig => {
        const src = fig.querySelector('.fig-b img');
        img.src = src.getAttribute('src'); img.alt = src.alt;
        title.textContent = (fig.querySelector('.no')?.textContent || '') + '  ' + (fig.querySelector('.ti')?.textContent || '');
        open.href = src.getAttribute('src');
        setW(96); lb.showModal();
      };
      document.querySelectorAll('figure.fig').forEach(fig => {
        fig.querySelector('.fig-b')?.addEventListener('click', () => show(fig));
        fig.querySelector('button.zoom')?.addEventListener('click', () => show(fig));
      });
      lb.querySelector('[data-z="in"]').addEventListener('click', () => setW(w + 30));
      lb.querySelector('[data-z="out"]').addEventListener('click', () => setW(w - 30));
      lb.querySelector('[data-z="fit"]').addEventListener('click', () => setW(96));
      lb.querySelector('[data-z="close"]').addEventListener('click', () => lb.close());
      lb.addEventListener('click', e => { if (e.target.classList.contains('lb-body')) lb.close(); });
    }

    /* ---------- stepper ---------- */
    document.querySelectorAll('[data-stepper]').forEach(st => {
      const panels = [...st.querySelectorAll('.st-panel')];
      const tabs = st.querySelector('.st-tabs');
      const prev = st.querySelector('[data-prev]');
      const next = st.querySelector('[data-next]');
      const count = st.querySelector('.st-nav span');
      let i = 0;
      const btns = panels.map((p, k) => {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'tab');
        b.textContent = (k + 1) + ' · ' + p.dataset.tab;
        b.addEventListener('click', () => go(k));
        tabs.appendChild(b); return b;
      });
      function go(k) {
        i = Math.max(0, Math.min(panels.length - 1, k));
        panels.forEach((p, n) => { p.hidden = n !== i; });
        btns.forEach((b, n) => b.setAttribute('aria-selected', n === i ? 'true' : 'false'));
        prev.disabled = i === 0; next.disabled = i === panels.length - 1;
        count.textContent = 'step ' + (i + 1) + ' of ' + panels.length;
        // keep the active tab visible by scrolling only the tab strip, never the page
        const b = btns[i];
        if (b.offsetLeft < tabs.scrollLeft) tabs.scrollLeft = b.offsetLeft - 10;
        else if (b.offsetLeft + b.offsetWidth > tabs.scrollLeft + tabs.clientWidth) tabs.scrollLeft = b.offsetLeft + b.offsetWidth - tabs.clientWidth + 10;
      }
      prev.addEventListener('click', () => go(i - 1));
      next.addEventListener('click', () => go(i + 1));
      go(0);
    });

    /* ---------- chapter keys: [ previous, ] next ---------- */
    addEventListener('keydown', e => {
      if (e.target.closest('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (lb && lb.open) return;
      const b = document.body.dataset;
      if (e.key === '[' && b.prev) location.href = b.prev;
      if (e.key === ']' && b.next) location.href = b.next;
    });
  });
})();
