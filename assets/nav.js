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

  function render(results) {
    focusedIdx = -1;
    if (!results.length) {
      drop.innerHTML = '<div class="nav-search-empty">No results found</div>';
    } else {
      drop.innerHTML = results.map(function (item, i) {
        var sub = item.sub ? ' — ' + esc(item.sub) : '';
        return '<a class="nav-search-result" href="' + esc(item.url) + '"' +
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

  // ARIA
  inp.setAttribute('role', 'combobox');
  inp.setAttribute('aria-autocomplete', 'list');
  inp.setAttribute('aria-haspopup', 'listbox');
  inp.setAttribute('aria-controls', 'navSearchDrop');
  drop.setAttribute('role', 'listbox');
  drop.setAttribute('aria-expanded', 'false');
})();

// ── SAVE PROGRESS ─────────────────────────────────────────────────────────────
function openSignInModal() {
  var modal = document.getElementById('signin-modal');
  var nameInput = document.getElementById('signin-name');
  if (!modal) return;
  if (nameInput) nameInput.value = '';
  modal.style.display = 'flex';
  if (nameInput) setTimeout(function () { nameInput.focus(); }, 50);
}
function closeSignInModal() {
  var modal = document.getElementById('signin-modal');
  if (modal) modal.style.display = 'none';
}
function submitSignIn() {
  var input = document.getElementById('signin-name');
  if (!input) return;
  var name = input.value.trim();
  if (!name) {
    input.style.borderColor = '#c5442a';
    input.style.animation = 'shake 0.3s ease';
    setTimeout(function () { input.style.animation = ''; input.style.borderColor = ''; }, 400);
    return;
  }
  localStorage.setItem('omotenashi:user:name', name);
  updateBanner(name);
  closeSignInModal();
}
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
    text.innerHTML = '<span style="color:#fff;">Hi, <strong>' + safeName + '</strong></span>';
    btn.textContent = 'Not you?';
    btn.onclick = signOut;
    btn.style.background = 'transparent';
    btn.style.border = '1px solid var(--border-default)';
    btn.style.color = 'var(--text-secondary)';
  } else {
    text.textContent = "Start tracking your progress today — no account needed";
    btn.textContent = 'Save Progress';
    btn.onclick = openSignInModal;
    btn.style.background = '#0a84ff';
    btn.style.border = 'none';
    btn.style.color = '#fff';
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

// Init modal events + banner
(function () {
  var modal = document.getElementById('signin-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeSignInModal();
    });
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = this.querySelectorAll('button, input');
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var m = document.getElementById('signin-modal');
      if (m && m.style.display === 'flex') closeSignInModal();
    }
  });
  var name = localStorage.getItem('omotenashi:user:name');
  if (name) updateBanner(name);
})();
