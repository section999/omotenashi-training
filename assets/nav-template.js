function renderNav() {
  return `<nav class="nav">
  <div class="nav-inner">
    <div class="nav-search-wrap">
      <div class="nav-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="navSearchInput" name="navSearch" placeholder="Search vocabulary and lessons" autocomplete="off" aria-label="Search vocabulary and lessons" />
      </div>
      <div id="navSearchDrop" class="nav-search-drop"></div>
    </div>
    <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener" aria-label="freeCodeCamp" style="position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;opacity:1;">
      <img class="logo-large" src="assets/fcc_primary_large.png" alt="freeCodeCamp" style="height:28px;width:auto;filter:brightness(0) invert(1);" onerror="this.style.display='none'" />
      <img class="logo-small" src="assets/fcc_primary_small.png" alt="freeCodeCamp" style="height:28px;width:auto;filter:brightness(0) invert(1);" onerror="this.style.display='none'" />
    </a>
    <div style="display:flex;align-items:center;gap:16px;margin-left:auto;">
      <span id="banner-text" style="display:none;font-size:0.78rem;color:#5f5f7a;white-space:nowrap;"></span>
      <button id="banner-btn" style="display:none;padding:5px 10px;border-radius:4px;font-size:0.72rem;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;color:#a3a3c2;background:transparent;border:1px solid #2a2a4a;"></button>
      <a href="dashboard.html" class="nav-cta" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#f1be32;color:#0a0a23;font-size:0.78rem;font-weight:700;font-family:'Cascadia Code','Fira Code',monospace;border-radius:6px;text-decoration:none;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a23" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </a>
      <div class="nav-menu-wrap">
        <button class="nav-menu-btn" aria-label="Open menu" onclick="this.nextElementSibling.classList.toggle('open')">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-dropdown">
          <a href="index.html">Main</a>
          <a href="curriculum.html">Curriculum</a>
          <a href="games.html">Games</a>
          <a href="vocabularypractice.html">Vocabulary</a>
          <a href="#" onclick="toggleMode();return false;">Switch Mode</a>
          <a href="https://www.freecodecamp.org/donate/" target="_blank" rel="noopener">Donate</a>
        </div>
      </div>
    </div>
  </div>
</nav>`
}
