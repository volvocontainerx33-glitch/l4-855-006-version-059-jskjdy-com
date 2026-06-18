(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  var filterPanel = document.querySelector('[data-filter-form]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-chip]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var grid = document.querySelector('.movie-grid');
    var noResults = document.createElement('div');
    var activeFilter = '';

    noResults.className = 'no-results';
    noResults.textContent = '没有找到匹配的内容';

    if (grid) {
      grid.appendChild(noResults);
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var chipMatch = !activeFilter || text.indexOf(normalize(activeFilter)) !== -1;
        var matched = keywordMatch && chipMatch;

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      noResults.style.display = visible ? 'none' : 'block';
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter-value') || '';
        applyFilter();
      });
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var trigger = document.querySelector('[data-player-trigger]');
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playMovie() {
      attachSource();

      if (trigger) {
        trigger.classList.add('hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (trigger) {
            trigger.classList.remove('hidden');
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playMovie);
    }

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && trigger) {
        trigger.classList.remove('hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
