;(function() {
  var KEY = 'omotenashi:analytics:optin'
  var DATA_KEY = 'omotenashi:analytics:events'

  if (localStorage.getItem(KEY) !== '1') return

  function track(category, action, label) {
    try {
      var data = JSON.parse(localStorage.getItem(DATA_KEY) || '[]')
      data.push({ c: category, a: action, l: label || '', t: Date.now() })
      if (data.length > 500) data = data.slice(-500)
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch(e) {}
  }

  track('page', 'view', location.pathname)

  document.addEventListener('click', function(e) {
    var target = e.target
    if (target.closest('.quiz-check')) track('quiz', 'check', '')
    if (target.closest('.jp-word')) track('tts', 'jp-word', target.textContent)
    if (target.closest('[onclick*="toggleMode"]')) track('theme', 'toggle', '')
    if (target.closest('[onclick*="openSignInModal"]')) track('auth', 'signin-modal', '')
  })

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      track('nav', 'arrow', e.key)
    }
  })

  window.__analytics = { track: track, exportData: function() {
    try { return JSON.parse(localStorage.getItem(DATA_KEY) || '[]') } catch(e) { return [] }
  }}
})()
