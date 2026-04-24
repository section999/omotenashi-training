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
