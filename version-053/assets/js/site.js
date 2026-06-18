document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 6200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
  function applyFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(' ');
    var activeFilters = {};
    selects.forEach(function (select) {
      if (select.value) {
        activeFilters[select.getAttribute('data-filter-select')] = select.value;
      }
    });
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type')
      ].join(' ').toLowerCase();
      var matchText = !query || haystack.indexOf(query) !== -1;
      var matchFilters = Object.keys(activeFilters).every(function (key) {
        return (card.getAttribute('data-' + key) || '') === activeFilters[key];
      });
      var show = matchText && matchFilters;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    var empty = document.querySelector('[data-empty]');
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }
  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });
  selects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });
});
