// ── SHARED NAV SEARCH ─────────────────────────────────────────────────────────
(function () {
  var inp = document.getElementById('navSearchInput');
  var drop = document.getElementById('navSearchDrop');
  if (!inp || !drop) return;

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var focusedIdx = -1;

  function query(q) {
    var ql = q.toLowerCase();
    return (window.SEARCH_INDEX || []).filter(function (item) {
      return (item.title  || '').toLowerCase().includes(ql) ||
             (item.text   || '').toLowerCase().includes(ql) ||
             (item.lesson || '').toLowerCase().includes(ql);
    }).slice(0, 8);
  }

  function resolveUrl(url) {
    if (location.pathname.includes('/pages/') && url.startsWith('pages/')) {
      return url.slice(6);
    }
    return url;
  }

  function render(results) {
    focusedIdx = -1;
    if (!results.length) {
      drop.innerHTML = '<div class="nav-search-empty">No results found</div>';
    } else {
      drop.innerHTML = results.map(function (item, i) {
        var sub = item.sub ? ' — ' + esc(item.sub) : '';
        return '<a class="nav-search-result" href="' + esc(resolveUrl(item.url)) + '"' +
               ' data-idx="' + i + '" role="option">' +
               '<strong>' + esc(item.title) + '</strong>' +
               '<small>' + esc(item.lesson || '') + sub + '</small>' +
               '</a>';
      }).join('');
    }
    drop.setAttribute('aria-expanded', 'true');
    drop.classList.add('open');
  }

  function hide() {
    drop.classList.remove('open');
    drop.setAttribute('aria-expanded', 'false');
    focusedIdx = -1;
  }

  function moveFocus(idx) {
    var items = drop.querySelectorAll('.nav-search-result');
    items.forEach(function (el, i) { el.classList.toggle('focused', i === idx); });
    focusedIdx = idx;
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
  }

  inp.addEventListener('input', function () {
    if (!inp.value.trim()) { hide(); return; }
    render(query(inp.value));
  });

  inp.addEventListener('keydown', function (e) {
    var items = drop.querySelectorAll('.nav-search-result');
    if (e.key === 'ArrowDown') {
      if (!drop.classList.contains('open')) return;
      e.preventDefault();
      moveFocus(Math.min(focusedIdx + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      if (!drop.classList.contains('open')) return;
      e.preventDefault();
      var next = Math.max(focusedIdx - 1, -1);
      moveFocus(next);
      if (next < 0) inp.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var target = focusedIdx >= 0 ? items[focusedIdx] : (items[0] || null);
      if (target) location.href = target.href;
    } else if (e.key === 'Escape') {
      hide(); inp.blur();
    }
  });

  inp.addEventListener('focus', function () {
    if (inp.value.trim()) render(query(inp.value));
  });

  document.addEventListener('click', function (e) {
    if (!inp.closest('.nav-search-wrap').contains(e.target)) hide();
  });

  // Mobile: shorten placeholder
  if (window.innerWidth <= 640) inp.placeholder = 'Search';

  // ARIA
  inp.setAttribute('role', 'combobox');
  inp.setAttribute('aria-autocomplete', 'list');
  inp.setAttribute('aria-haspopup', 'listbox');
  inp.setAttribute('aria-controls', 'navSearchDrop');
  drop.setAttribute('role', 'listbox');
  drop.setAttribute('aria-expanded', 'false');
})();

// ── NAV DROPDOWN: CLOSE ON OUTSIDE CLICK ──────────────────────────────────────
document.addEventListener('click', function(e) {
  document.querySelectorAll('.nav-dropdown.open').forEach(function(d) {
    if (!d.parentElement.contains(e.target)) d.classList.remove('open');
  });
});

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────
function toggleMode() {
  var html = document.documentElement;
  var isLight = html.getAttribute('data-theme') === 'light';
  html.setAttribute('data-theme', isLight ? 'dark' : 'light');
  try { localStorage.setItem('theme', isLight ? 'dark' : 'light'); } catch(e) {}
}

// ── SAVE PROGRESS ─────────────────────────────────────────────────────────────
function signOut() {
  localStorage.removeItem('omotenashi:user:name');
  updateBanner(null);
}
function updateBanner(name) {
  var text = document.getElementById('banner-text');
  var btn  = document.getElementById('banner-btn');
  if (!text || !btn) return;
  if (name) {
    var safeName = name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    text.innerHTML = '<span style="color:#fff;font-family:\'Cascadia Code\',\'Fira Code\',\'Consolas\',monospace;">Hi, <strong>' + safeName + '</strong></span>';
    btn.textContent = 'Not you?';
    btn.onclick = signOut;
    btn.style.background = 'transparent';
    btn.style.border = '1px solid #2a2a4a';
    btn.style.color = '#a3a3c2';
    btn.style.fontFamily = '\'Cascadia Code\',\'Fira Code\',\'Consolas\',monospace';
    text.style.display = 'inline';
    btn.style.display = 'inline-block';
  }
}
function exportProgress() {
  var data = {};
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && k.startsWith('omotenashi:')) data[k] = localStorage.getItem(k);
  }
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'omotenashi-progress-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importProgress() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        var count = 0;
        for (var key in data) {
          if (data.hasOwnProperty(key) && key.startsWith('omotenashi:')) {
            localStorage.setItem(key, data[key]);
            count++;
          }
        }
        alert('Imported ' + count + ' entries. Refreshing...');
        location.reload();
      } catch(err) {
        alert('Invalid file. Please select a valid progress export.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Init banner
(function () {
  var name = localStorage.getItem('omotenashi:user:name');
  if (name) updateBanner(name);
})();
