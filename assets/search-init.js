;(function() {
  var loaded = false
  var loading = false

  function loadSearchIndex() {
    if (loaded || loading) return
    loading = true
    var s = document.createElement('script')
    s.src = 'assets/search.js'
    s.async = true
    s.onload = function() { loaded = true; loading = false }
    s.onerror = function() { loading = false }
    document.body.appendChild(s)
  }

  document.addEventListener('focusin', function(e) {
    if (e.target && e.target.id === 'navSearchInput') loadSearchIndex()
  })
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      loadSearchIndex()
      var inp = document.getElementById('navSearchInput')
      if (inp) setTimeout(function() { inp.focus() }, 100)
    }
  })
})()
