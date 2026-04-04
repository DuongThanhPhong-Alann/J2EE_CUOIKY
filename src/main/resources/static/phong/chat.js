(() => {
  const mode = document.querySelector('.aptChatMode');
  if (!mode) {
    return;
  }

  document.body.classList.add('aptChatRoute');

  const API_URL = '/chat/preferences';

  const WALLPAPERS = {
    1: 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/chat/z7652768156094_48c77ce49c6440e0ab2e33a547fb751d.jpg',
    2: 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/chat/z7652854577202_d5854d28fbaacaf2193d830a824cc63d.jpg',
    3: 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/chat/z7652854577203_9cfdf86cda6c2146da1bb08f36c01907.jpg',
    4: 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/chat/z7652854624594_7e41e1255b75b6f6dfee1c3fd65b0250.jpg',
    5: 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/chat/z7652854624638_1bb8f2f0196db78d72ea3cd81f7cef28.jpg',
    6: 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/chat/z7652854655672_7c8eb88a7a84b2685792d852e21e65b1.jpg',
  };

  const themeBtn = document.getElementById('chatThemeBtn');
  const themePopover = document.getElementById('chatThemePopover');
  const themeGrid = document.getElementById('chatThemeGrid');

  const bgBtn = document.getElementById('chatBgBtn');
  const bgPopover = document.getElementById('chatBgPopover');
  const bgGrid = document.getElementById('chatBgGrid');

  const fullscreenBtn = document.getElementById('chatFullscreenBtn');

  const PRESET_THEMES = new Set(['aurora', 'ocean', 'grape', 'emerald', 'sunset', 'midnight']);
  const isSolidTheme = (t) => /^s:[0-9a-f]{6}$/.test(String(t || ''));
  const isGradientTheme = (t) => /^g:[0-9a-f]{6}:[0-9a-f]{6}$/.test(String(t || ''));

  const clearCustomThemeVars = () => {
    mode.style.removeProperty('--aptchat-accent-1');
    mode.style.removeProperty('--aptchat-accent-2');
    mode.style.removeProperty('--aptchat-accent-grad');
    mode.style.removeProperty('--aptchat-accent-soft');
  };

  const applyCustomTheme = (c1, c2) => {
    mode.style.setProperty('--aptchat-accent-1', `#${c1}`);
    mode.style.setProperty('--aptchat-accent-2', `#${c2}`);
    mode.style.setProperty('--aptchat-accent-grad', `linear-gradient(135deg, #${c1}, #${c2})`);
    mode.style.setProperty(
      '--aptchat-accent-soft',
      `linear-gradient(135deg, rgba(${hexToRgb(c1).join(',')}, .28), rgba(${hexToRgb(c2).join(',')}, .28))`
    );
  };

  const applyTheme = (theme) => {
    const t = String(theme || 'aurora').trim().toLowerCase();

    if (PRESET_THEMES.has(t)) {
      clearCustomThemeVars();
      if (t === 'aurora') {
        delete document.body.dataset.aptchatTheme;
      } else {
        document.body.dataset.aptchatTheme = t;
      }
      return;
    }

    if (isSolidTheme(t)) {
      delete document.body.dataset.aptchatTheme;
      const c = t.split(':')[1];
      applyCustomTheme(c, c);
      return;
    }

    if (isGradientTheme(t)) {
      delete document.body.dataset.aptchatTheme;
      const [, c1, c2] = t.split(':');
      applyCustomTheme(c1, c2);
      return;
    }

    clearCustomThemeVars();
    delete document.body.dataset.aptchatTheme;
  };

  const applyWallpaper = (wallpaper) => {
    const val = String(wallpaper ?? 'none');
    if (!val || val === 'none') {
      mode.style.setProperty('--aptchat-wallpaper', 'none');
      return;
    }
    const url = WALLPAPERS[val];
    if (!url) {
      mode.style.setProperty('--aptchat-wallpaper', 'none');
      return;
    }
    mode.style.setProperty('--aptchat-wallpaper', `url("${url}")`);
  };

  let persistTimer = null;
  let pendingPatch = {};
  let currentTheme = 'aurora';
  let currentWallpaper = 'none';

  const persist = (patch) => {
    pendingPatch = { ...pendingPatch, ...patch };
    if (persistTimer) {
      clearTimeout(persistTimer);
    }
    persistTimer = setTimeout(async () => {
      const payload = pendingPatch;
      pendingPatch = {};
      persistTimer = null;

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          return;
        }
        const saved = await res.json();
        if (saved?.theme) {
          currentTheme = saved.theme;
          try { localStorage.setItem('aptChatTheme', saved.theme); } catch {}
          applyTheme(saved.theme);
          syncActiveSwatches();
        }
        if (saved?.wallpaper) {
          currentWallpaper = saved.wallpaper;
          try { localStorage.setItem('aptChatBg', saved.wallpaper); } catch {}
          applyWallpaper(saved.wallpaper);
          syncActiveWallpapers();
        }
        if (typeof saved?.fullscreen === 'boolean') {
          try { localStorage.setItem('aptChatFullscreen', saved.fullscreen ? '1' : '0'); } catch {}
        }
      } catch {
        // ignore
      }
    }, 350);
  };

  const setFullscreen = (on, options = {}) => {
    const enabled = Boolean(on);
    document.body.classList.toggle('aptChatPage', enabled);
    try {
      localStorage.setItem('aptChatFullscreen', enabled ? '1' : '0');
    } catch {
      // ignore
    }
  if (options.persist !== false) {
      persist({ fullscreen: enabled });
    }
    if (fullscreenBtn) {
      fullscreenBtn.textContent = enabled ? 'Thoát toàn màn hình' : 'Toàn màn hình';
    }
  };

  try {
    const storedFullscreen = localStorage.getItem('aptChatFullscreen');
    setFullscreen(storedFullscreen === null ? true : storedFullscreen === '1', { persist: false });
  } catch {
    setFullscreen(true, { persist: false });
  }

  try {
    currentTheme = localStorage.getItem('aptChatTheme') || 'aurora';
    applyTheme(currentTheme);

    currentWallpaper = localStorage.getItem('aptChatBg') || 'none';
    applyWallpaper(currentWallpaper);
  } catch {
    // ignore
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      setFullscreen(!document.body.classList.contains('aptChatPage'));
    });
  }

  const hidePopovers = () => {
    if (themePopover) themePopover.hidden = true;
    if (bgPopover) bgPopover.hidden = true;
  };

  const togglePopover = (popover) => {
    if (!popover) return;
    const willShow = popover.hidden;
    hidePopovers();
    popover.hidden = !willShow;
  };

  if (themeBtn && themePopover) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover(themePopover);
    });
  }
  if (themePopover) {
    themePopover.addEventListener('click', (e) => e.stopPropagation());
  }
  if (bgBtn && bgPopover) {
    bgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover(bgPopover);
    });
  }
  if (bgPopover) {
    bgPopover.addEventListener('click', (e) => e.stopPropagation());
  }

  document.addEventListener('click', () => hidePopovers());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hidePopovers();
    }
  });

  const THEMES = buildThemeList100();

  function syncActiveSwatches() {
    if (!themeGrid) return;
    for (const el of themeGrid.querySelectorAll('.aptChatSwatch')) {
      el.classList.toggle('aptChatSwatchActive', el.dataset.theme === currentTheme);
    }
  }

  function syncActiveWallpapers() {
    if (!bgGrid) return;
    for (const el of bgGrid.querySelectorAll('.aptChatWallpaper')) {
      el.classList.toggle('aptChatWallpaperActive', el.dataset.wallpaper === currentWallpaper);
    }
  }

  const renderThemes = () => {
    if (!themeGrid) return;
    themeGrid.innerHTML = '';
    for (const t of THEMES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aptChatSwatch';
      btn.dataset.theme = t.id;
      btn.style.setProperty('--swatch', t.swatch);
      btn.title = t.label || t.id;

      btn.addEventListener('mouseenter', () => applyTheme(t.id));
      btn.addEventListener('mouseleave', () => applyTheme(currentTheme));
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        currentTheme = t.id;
        applyTheme(currentTheme);
        syncActiveSwatches();
        persist({ theme: currentTheme });
      });
      themeGrid.appendChild(btn);
    }
    syncActiveSwatches();
  };

  const renderWallpapers = () => {
    if (!bgGrid) return;
    bgGrid.innerHTML = '';

    const items = [
      { id: 'none', label: 'Không', url: null },
      ...Object.entries(WALLPAPERS).map(([id, url]) => ({ id, label: `Nền ${id}`, url })),
    ];

    for (const it of items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aptChatWallpaper';
      btn.dataset.wallpaper = it.id;
      if (it.url) {
        btn.style.backgroundImage = `url("${it.url}")`;
      } else {
        btn.style.backgroundImage = 'linear-gradient(135deg, rgba(59,130,246,.18), rgba(168,85,247,.16))';
      }

      const label = document.createElement('div');
      label.className = 'aptChatWallpaperLabel';
      label.textContent = it.label;
      btn.appendChild(label);

      btn.addEventListener('mouseenter', () => applyWallpaper(it.id));
      btn.addEventListener('mouseleave', () => applyWallpaper(currentWallpaper));
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        currentWallpaper = it.id;
        applyWallpaper(currentWallpaper);
        syncActiveWallpapers();
        persist({ wallpaper: currentWallpaper });
      });

      bgGrid.appendChild(btn);
    }

    syncActiveWallpapers();
  };

  renderThemes();
  renderWallpapers();

  (async () => {
    try {
      const res = await fetch(API_URL, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) {
        return;
      }
      const pref = await res.json();

      if (pref?.theme) {
        currentTheme = pref.theme;
        applyTheme(pref.theme);
        try { localStorage.setItem('aptChatTheme', pref.theme); } catch {}
        syncActiveSwatches();
      }

      if (pref?.wallpaper) {
        currentWallpaper = pref.wallpaper;
        applyWallpaper(pref.wallpaper);
        try { localStorage.setItem('aptChatBg', pref.wallpaper); } catch {}
        syncActiveWallpapers();
      }

      if (typeof pref?.fullscreen === 'boolean') {
        setFullscreen(pref.fullscreen, { persist: false });
      }
    } catch {
      // ignore
    }
  })();

  const textarea = document.querySelector('.aptChatTextarea[name="noiDung"]');
  const form = textarea?.closest('form');
  const msgs = document.getElementById('msgs');

  if (msgs) {
    msgs.scrollTop = msgs.scrollHeight;
  }

  if (textarea && form) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }

  function hexToRgb(hex) {
    const h = String(hex || '').replace('#', '').toLowerCase();
    const v = parseInt(h, 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function hslToHex(h, s, l) {
    const hh = ((h % 360) + 360) % 360;
    const ss = Math.max(0, Math.min(100, s)) / 100;
    const ll = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * ll - 1)) * ss;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = ll - c / 2;

    let r1 = 0, g1 = 0, b1 = 0;
    if (hh < 60) { r1 = c; g1 = x; b1 = 0; }
    else if (hh < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (hh < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (hh < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (hh < 300) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }

    const r = Math.round((r1 + m) * 255);
    const g = Math.round((g1 + m) * 255);
    const b = Math.round((b1 + m) * 255);

    return [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  }

  function buildThemeList100() {
    const list = [];

    list.push({ id: 'aurora', label: 'Aurora', swatch: 'linear-gradient(135deg, #3b82f6, #a855f7)' });
    list.push({ id: 'ocean', label: 'Ocean', swatch: 'linear-gradient(135deg, #0ea5e9, #2563eb)' });
    list.push({ id: 'grape', label: 'Grape', swatch: 'linear-gradient(135deg, #7c3aed, #ec4899)' });
    list.push({ id: 'emerald', label: 'Emerald', swatch: 'linear-gradient(135deg, #22c55e, #06b6d4)' });
    list.push({ id: 'sunset', label: 'Sunset', swatch: 'linear-gradient(135deg, #f97316, #a855f7)' });
    list.push({ id: 'midnight', label: 'Midnight', swatch: 'linear-gradient(135deg, #0b1220, #111827)' });

    // 40 solid themes
    for (let i = 0; i < 40; i++) {
      const hue = Math.round((i * 360) / 40);
      const hex = hslToHex(hue, 88, 54);
      list.push({ id: `s:${hex}`, label: `Solid ${i + 1}`, swatch: `#${hex}` });
    }

    // 54 gradient themes (pairs of hues)
    for (let i = 0; i < 54; i++) {
      const h1 = Math.round((i * 360) / 54);
      const h2 = Math.round((h1 + 90 + (i % 3) * 25) % 360);
      const c1 = hslToHex(h1, 90, 54);
      const c2 = hslToHex(h2, 90, 54);
      list.push({ id: `g:${c1}:${c2}`, label: `Gradient ${i + 1}`, swatch: `linear-gradient(135deg, #${c1}, #${c2})` });
    }

    return list.slice(0, 100);
  }
})();
