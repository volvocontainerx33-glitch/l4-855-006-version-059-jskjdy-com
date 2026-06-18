(function () {
  function setupNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    var index = 0;
    function show(next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) dots[index].classList.remove('is-active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      if (dots[index]) dots[index].classList.add('is-active');
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-movie-grid]'));
    if (!grids.length) return;
    var input = document.querySelector('[data-filter-input]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var category = document.querySelector('[data-filter-category]');
    var empty = document.querySelector('[data-empty-state]');
    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }
    function apply() {
      var query = value(input);
      var typeValue = value(type);
      var yearValue = value(year);
      var categoryValue = value(category);
      var visible = 0;
      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')).forEach(function (card) {
          var text = (card.getAttribute('data-keywords') || '').toLowerCase();
          var cardType = (card.getAttribute('data-type') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
          var matched = true;
          if (query && text.indexOf(query) === -1) matched = false;
          if (typeValue && cardType !== typeValue) matched = false;
          if (yearValue && cardYear !== yearValue) matched = false;
          if (categoryValue && cardCategory !== categoryValue) matched = false;
          card.classList.toggle('is-hidden', !matched);
          if (matched) visible += 1;
        });
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }
    [input, type, year, category].forEach(function (node) {
      if (node) node.addEventListener('input', apply);
      if (node) node.addEventListener('change', apply);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
}());
