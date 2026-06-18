(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilter() {
    var input = document.querySelector('[data-filter-input]');
    if (!input) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty]');

    function apply() {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !q || text.indexOf(q) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });
      if (empty) empty.classList.toggle('show', visible === 0);
    }

    input.addEventListener('input', apply);
    apply();
  }

  function initSearchPage() {
    var box = document.querySelector('[data-site-search]');
    var results = document.querySelector('[data-search-results]');
    if (!box || !results || !window.MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    box.value = initial;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card" data-card>' +
        '<a class="poster-link" href="movie/' + movie.url + '">' +
        '<span class="poster-frame"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><a href="category/' + movie.categorySlug + '.html">' + escapeHtml(movie.categoryName) + '</a></div>' +
        '<h3><a href="movie/' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (ch) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch];
      });
    }

    function run() {
      var q = box.value.trim().toLowerCase();
      var list = window.MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.categoryName, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(card).join('');
      var empty = document.querySelector('[data-empty]');
      if (empty) empty.classList.toggle('show', list.length === 0);
    }

    var form = document.querySelector('[data-search-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        run();
      });
    }
    box.addEventListener('input', run);
    run();
  }

  function initHomeSearch() {
    var form = document.querySelector('[data-home-search]');
    var input = document.querySelector('[data-home-search-input]');
    if (!form || !input) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = 'search.html';
      if (q) url += '?q=' + encodeURIComponent(q);
      window.location.href = url;
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var stream = player.getAttribute('data-stream');
      var video = player.querySelector('video');
      var mask = player.querySelector('[data-play-button]');
      var loaded = false;
      if (!stream || !video || !mask) return;

      function loadAndPlay() {
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({enableWorker: true, lowLatencyMode: true});
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
          } else {
            video.src = stream;
          }
          loaded = true;
        }
        mask.hidden = true;
        video.controls = true;
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            mask.hidden = false;
          });
        }
      }

      mask.addEventListener('click', loadAndPlay);
      video.addEventListener('click', function () {
        if (!loaded) loadAndPlay();
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilter();
    initSearchPage();
    initHomeSearch();
    initPlayers();
  });
})();
