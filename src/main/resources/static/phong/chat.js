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

  const userSearchBtn = document.getElementById('chatUserSearchBtn');
  const userSearchPopover = document.getElementById('chatUserSearchPopover');
  const userSearchInput = document.getElementById('chatUserSearchInput');
  const userSearchList = document.getElementById('chatUserSearchList');

  const shareAptBtn = document.getElementById('chatShareAptBtn');
  const shareAptPopover = document.getElementById('chatShareAptPopover');
  const shareBuildingSelect = document.getElementById('chatShareBuildingSelect');
  const shareApartmentSelect = document.getElementById('chatShareApartmentSelect');
  const shareApartmentLink = document.getElementById('chatShareApartmentLink');
  const shareCopyBtn = document.getElementById('chatShareCopyLinkBtn');
  const shareInsertBtn = document.getElementById('chatShareInsertLinkBtn');

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

  const lsGet = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };

  const lsSet = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      // ignore
    }
  };

  const persist = (patch) => {
    // Save locally immediately so it survives reloads even if the API/DB is unavailable.
    if (patch && typeof patch === 'object') {
      if (patch.theme != null) {
        lsSet('aptChatTheme', String(patch.theme));
      }
      if (patch.wallpaper != null) {
        lsSet('aptChatBg', String(patch.wallpaper));
      }
      if (typeof patch.fullscreen === 'boolean') {
        lsSet('aptChatFullscreen', patch.fullscreen ? '1' : '0');
      }
    }

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
          lsSet('aptChatTheme', saved.theme);
          applyTheme(saved.theme);
          syncActiveSwatches();
        }
        if (saved?.wallpaper) {
          currentWallpaper = saved.wallpaper;
          lsSet('aptChatBg', saved.wallpaper);
          applyWallpaper(saved.wallpaper);
          syncActiveWallpapers();
        }
        if (typeof saved?.fullscreen === 'boolean') {
          lsSet('aptChatFullscreen', saved.fullscreen ? '1' : '0');
        }
      } catch {
        // ignore
      }
    }, 350);
  };

  const setFullscreen = (on, options = {}) => {
    const enabled = Boolean(on);
    document.body.classList.toggle('aptChatPage', enabled);
    lsSet('aptChatFullscreen', enabled ? '1' : '0');
    if (options.persist !== false) {
      persist({ fullscreen: enabled });
    }
    if (fullscreenBtn) {
      fullscreenBtn.textContent = enabled ? 'Thoát toàn màn hình' : 'Toàn màn hình';
    }
  };

  try {
    const storedFullscreen = lsGet('aptChatFullscreen');
    setFullscreen(storedFullscreen === null ? true : storedFullscreen === '1', { persist: false });
  } catch {
    setFullscreen(true, { persist: false });
  }

  try {
    currentTheme = lsGet('aptChatTheme') || 'aurora';
    applyTheme(currentTheme);

    currentWallpaper = lsGet('aptChatBg') || 'none';
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
    if (userSearchPopover) userSearchPopover.hidden = true;
    if (shareAptPopover) shareAptPopover.hidden = true;
    document.body.classList.remove('aptChatPopoverOpen');
  };

  const togglePopover = (popover) => {
    if (!popover) return;
    const willShow = popover.hidden;
    hidePopovers();
    popover.hidden = !willShow;
    if (willShow) {
      document.body.classList.add('aptChatPopoverOpen');
    } else {
      document.body.classList.remove('aptChatPopoverOpen');
    }
  };

  if (themeBtn && themePopover) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover(themePopover);
    });
  }
  if (themePopover) {
    themePopover.addEventListener('click', (e) => {
      if (e.target?.closest?.('[data-close-popover]')) {
        e.preventDefault();
        hidePopovers();
        return;
      }
      e.stopPropagation();
    });
  }
  if (bgBtn && bgPopover) {
    bgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover(bgPopover);
    });
  }
  if (bgPopover) {
    bgPopover.addEventListener('click', (e) => {
      if (e.target?.closest?.('[data-close-popover]')) {
        e.preventDefault();
        hidePopovers();
        return;
      }
      e.stopPropagation();
    });
  }

  if (userSearchBtn && userSearchPopover) {
    userSearchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover(userSearchPopover);
      if (!userSearchPopover.hidden) {
        queueSearch('');
        setTimeout(() => userSearchInput?.focus(), 0);
      }
    });
  }
  if (userSearchPopover) {
    userSearchPopover.addEventListener('click', (e) => {
      if (e.target?.closest?.('[data-close-popover]')) {
        e.preventDefault();
        hidePopovers();
        return;
      }
      e.stopPropagation();
    });
  }

  if (shareAptBtn && shareAptPopover) {
    shareAptBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover(shareAptPopover);
      if (!shareAptPopover.hidden) {
        setTimeout(() => shareBuildingSelect?.focus?.(), 0);
        initApartmentShare();
      }
    });
  }
  if (shareAptPopover) {
    shareAptPopover.addEventListener('click', (e) => {
      if (e.target?.closest?.('[data-close-popover]')) {
        e.preventDefault();
        hidePopovers();
        return;
      }
      e.stopPropagation();
    });
  }

  document.addEventListener('click', () => hidePopovers());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hidePopovers();
    }
  });

  let searchTimer = null;
  let searchAbort = null;
  let shareInitPromise = null;
  let shareApartmentsAbort = null;

  const renderUserResults = (items) => {
    if (!userSearchList) return;
    userSearchList.innerHTML = '';

    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'aptChatUserEmpty';
      empty.textContent = 'Không có gợi ý.';
      userSearchList.appendChild(empty);
      return;
    }

    for (const it of list) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `aptChatUserItem aptChatUserItem--${it.role || 'guest'}`;
      btn.addEventListener('click', () => {
        if (it?.id) {
          window.location.href = `/chat/private/with/${encodeURIComponent(String(it.id))}`;
        }
      });

      const dot = document.createElement('span');
      dot.className = `aptChatPeerDot aptChatPeerDot--${it.role || 'guest'}`;
      dot.setAttribute('aria-hidden', 'true');

      const meta = document.createElement('span');
      meta.className = 'aptChatUserMeta';

      const name = document.createElement('span');
      name.className = 'aptChatUserName';
      name.textContent = String(it?.name || it?.email || '');

      const email = document.createElement('span');
      email.className = 'aptChatUserEmail';
      email.textContent = String(it?.email || '');

      meta.appendChild(name);
      meta.appendChild(email);

      btn.appendChild(dot);
      btn.appendChild(meta);

      userSearchList.appendChild(btn);
    }
  };

  const queueSearch = (q) => {
    if (!userSearchPopover || userSearchPopover.hidden) return;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(q), 180);
  };

  const runSearch = async (q) => {
    const query = String(q ?? '');
    if (!userSearchList) return;

    if (searchAbort) {
      try { searchAbort.abort(); } catch {}
    }
    searchAbort = new AbortController();

    try {
      const url = `/chat/private/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: searchAbort.signal });
      if (!res.ok) {
        renderUserResults([]);
        return;
      }
      const data = await res.json();
      renderUserResults(data);
    } catch {
      renderUserResults([]);
    }
  };

  if (userSearchInput) {
    userSearchInput.addEventListener('input', () => queueSearch(userSearchInput.value));
    userSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const email = String(userSearchInput.value || '').trim();
        if (!email) return;
        window.location.href = `/chat/private/open?email=${encodeURIComponent(email)}`;
      }
    });
  }

  async function initApartmentShare() {
    if (!shareBuildingSelect || !shareApartmentSelect || !shareApartmentLink || !shareCopyBtn || !shareInsertBtn) {
      return;
    }

    if (!shareAptPopover?.dataset?.wired) {
      shareAptPopover.dataset.wired = '1';

      shareBuildingSelect.addEventListener('change', () => {
        const buildingId = String(shareBuildingSelect.value || '');
        resetShareSelection();
        if (buildingId) {
          loadShareApartments(buildingId);
        }
      });

      shareApartmentSelect.addEventListener('change', () => updateShareLink());

      shareCopyBtn.addEventListener('click', async () => {
        const v = String(shareApartmentLink.value || '').trim();
        if (!v) return;
        try {
          await navigator.clipboard.writeText(v);
          shareCopyBtn.textContent = 'Đã copy';
          setTimeout(() => (shareCopyBtn.textContent = 'Copy'), 900);
        } catch {
          try {
            shareApartmentLink.focus();
            shareApartmentLink.select();
            document.execCommand('copy');
          } catch {
            // ignore
          }
        }
      });

      shareInsertBtn.addEventListener('click', () => {
        const v = String(shareApartmentLink.value || '').trim();
        if (!v) return;
        const textarea = document.querySelector('.aptChatTextarea[name="noiDung"]');
        if (!textarea) return;

        const before = String(textarea.value || '');
        const needsNewline = before && !before.endsWith('\n');
        textarea.value = before + (needsNewline ? '\n' : '') + v;
        textarea.focus();
        hidePopovers();
      });
    }

    if (shareInitPromise) {
      return shareInitPromise;
    }

    shareInitPromise = (async () => {
      shareBuildingSelect.disabled = true;
      shareBuildingSelect.innerHTML = '<option value="">Đang tải...</option>';
      shareApartmentSelect.disabled = true;
      shareApartmentSelect.innerHTML = '<option value="">Chọn chung cư trước</option>';
      shareApartmentLink.value = '';
      shareCopyBtn.disabled = true;
      shareInsertBtn.disabled = true;

      try {
        const res = await fetch('/chat/share/buildings', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
          throw new Error('bad response');
        }
        const buildings = await res.json();
        const list = Array.isArray(buildings) ? buildings : [];

        shareBuildingSelect.innerHTML = '<option value="">Chọn chung cư</option>';
        for (const b of list) {
          if (!b?.id) continue;
          const opt = document.createElement('option');
          opt.value = String(b.id);
          opt.textContent = String(b.name || `Chung cư #${b.id}`);
          shareBuildingSelect.appendChild(opt);
        }

        shareBuildingSelect.disabled = false;
        if (shareBuildingSelect.options.length === 2) {
          // auto-pick when only 1 building available
          shareBuildingSelect.selectedIndex = 1;
          loadShareApartments(String(shareBuildingSelect.value));
        }
      } catch {
        shareBuildingSelect.innerHTML = '<option value="">Không tải được danh sách chung cư</option>';
        shareInitPromise = null;
      } finally {
        shareBuildingSelect.disabled = false;
      }
    })();

    try {
      await shareInitPromise;
    } catch {
      // ignore
    }
  }

  function resetShareSelection() {
    if (shareApartmentSelect) {
      shareApartmentSelect.disabled = true;
      shareApartmentSelect.innerHTML = '<option value="">Đang tải...</option>';
    }
    if (shareApartmentLink) {
      shareApartmentLink.value = '';
    }
    if (shareCopyBtn) shareCopyBtn.disabled = true;
    if (shareInsertBtn) shareInsertBtn.disabled = true;
  }

  async function loadShareApartments(buildingId) {
    if (!shareApartmentSelect) return;
    const id = String(buildingId || '').trim();
    if (!id) return;

    if (shareApartmentsAbort) {
      try { shareApartmentsAbort.abort(); } catch {}
    }
    shareApartmentsAbort = new AbortController();

    shareApartmentSelect.disabled = true;
    shareApartmentSelect.innerHTML = '<option value="">Đang tải...</option>';

    try {
      const url = `/chat/share/apartments?buildingId=${encodeURIComponent(id)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: shareApartmentsAbort.signal });
      if (!res.ok) {
        throw new Error('bad response');
      }
      const apartments = await res.json();
      const list = Array.isArray(apartments) ? apartments : [];

      shareApartmentSelect.innerHTML = '<option value="">Chọn căn hộ</option>';
      for (const a of list) {
        if (!a?.id) continue;
        const opt = document.createElement('option');
        opt.value = String(a.id);
        const code = a.code ? String(a.code) : `#${a.id}`;
        const status = a.status ? ` • ${String(a.status)}` : '';
        opt.textContent = `${code}${status}`;
        shareApartmentSelect.appendChild(opt);
      }

      shareApartmentSelect.disabled = false;
    } catch {
      shareApartmentSelect.innerHTML = '<option value="">Không tải được danh sách căn hộ</option>';
      shareApartmentSelect.disabled = true;
    }
  }

  function updateShareLink() {
    if (!shareApartmentSelect || !shareApartmentLink || !shareCopyBtn || !shareInsertBtn) return;
    const aptId = String(shareApartmentSelect.value || '').trim();
    if (!aptId) {
      shareApartmentLink.value = '';
      shareCopyBtn.disabled = true;
      shareInsertBtn.disabled = true;
      return;
    }

    const url = new URL(`/can-ho/${encodeURIComponent(aptId)}`, window.location.origin).toString();
    shareApartmentLink.value = url;
    shareCopyBtn.disabled = false;
    shareInsertBtn.disabled = false;
  }

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
        hidePopovers();
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
        hidePopovers();
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

      const localTheme = lsGet('aptChatTheme');
      const localWallpaper = lsGet('aptChatBg');
      const localFullscreen = lsGet('aptChatFullscreen');

      const serverTheme = pref?.theme ? String(pref.theme) : null;
      const serverWallpaper = pref?.wallpaper ? String(pref.wallpaper) : null;
      const serverFullscreen = typeof pref?.fullscreen === 'boolean' ? pref.fullscreen : null;

      const serverLooksDefault =
        serverTheme === 'aurora' &&
        serverWallpaper === 'none' &&
        serverFullscreen === true;

      const localLooksCustom =
        (localTheme != null && localTheme !== 'aurora') ||
        (localWallpaper != null && localWallpaper !== 'none') ||
        (localFullscreen != null && localFullscreen !== '1');

      // If the server falls back to defaults (e.g. missing DB table) and the user has
      // local overrides, keep local overrides instead of overwriting them with defaults.
      const shouldApplyServer = !(serverLooksDefault && localLooksCustom);

      if (shouldApplyServer) {
        if (serverTheme) {
          currentTheme = serverTheme;
          applyTheme(serverTheme);
          lsSet('aptChatTheme', serverTheme);
          syncActiveSwatches();
        }

        if (serverWallpaper) {
          currentWallpaper = serverWallpaper;
          applyWallpaper(serverWallpaper);
          lsSet('aptChatBg', serverWallpaper);
          syncActiveWallpapers();
        }

        if (serverFullscreen != null) {
          setFullscreen(serverFullscreen, { persist: false });
        }
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

  linkifyChatMessages();

  if (textarea && form) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }

  function linkifyChatMessages() {
    const els = document.querySelectorAll('.aptChatText');
    for (const el of els) {
      if (el.dataset.linkified === '1') continue;
      const raw = String(el.textContent || '');
      el.dataset.linkified = '1';
      if (!raw) continue;

      const html = linkifyText(raw);
      if (html !== escapeHtml(raw)) {
        el.innerHTML = html;
      }
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function linkifyText(raw) {
    const text = String(raw || '');
    const re = /https?:\/\/[^\s]+/g;
    let out = '';
    let last = 0;
    let m;

    while ((m = re.exec(text))) {
      const start = m.index;
      const full = String(m[0] || '');
      if (start > last) {
        out += escapeHtml(text.slice(last, start));
      }

      let url = full;
      let trailing = '';
      while (url && /[),.;!?]$/.test(url)) {
        trailing = url.slice(-1) + trailing;
        url = url.slice(0, -1);
      }

      const safeUrl = escapeHtml(url);
      out += `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
      if (trailing) {
        out += escapeHtml(trailing);
      }
      last = start + full.length;
    }

    if (last < text.length) {
      out += escapeHtml(text.slice(last));
    }
    return out;
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
