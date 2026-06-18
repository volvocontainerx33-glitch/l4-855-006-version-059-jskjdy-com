(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-btn");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(open));
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    });

    document.querySelectorAll(".filter-scope, .quick-search-card").forEach(function (scope) {
      var search = scope.querySelector(".filter-search");
      var type = scope.querySelector(".filter-type");
      var year = scope.querySelector(".filter-year");
      var reset = scope.querySelector(".filter-reset");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      var empty = scope.querySelector(".filter-empty");

      function currentValue(node) {
        return node ? node.value.trim().toLowerCase() : "";
      }

      function applyFilter() {
        var query = currentValue(search);
        var selectedType = currentValue(type);
        var selectedYear = currentValue(year);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags
          ].join(" ").toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !selectedType || String(card.dataset.type || "").toLowerCase() === selectedType;
          var matchesYear = !selectedYear || String(card.dataset.year || "") === selectedYear;
          var show = matchesQuery && matchesType && matchesYear;
          card.classList.toggle("filtered-out", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [search, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener("input", applyFilter);
          node.addEventListener("change", applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (year) {
            year.value = "";
          }
          applyFilter();
        });
      }
    });
  });
})();
