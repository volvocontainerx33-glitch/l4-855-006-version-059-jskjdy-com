(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function() {
    var toggle = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function() {
        var opened = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length) {
      showSlide(0);
      startHero();
      if (prev) {
        prev.addEventListener("click", function() {
          showSlide(current - 1);
          startHero();
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          showSlide(current + 1);
          startHero();
        });
      }
      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
          startHero();
        });
      });
    }

    var searchInput = document.querySelector("[data-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".no-results");
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var query = normalize(searchInput ? searchInput.value : "");
      var visibleCount = 0;
      cards.forEach(function(card) {
        var text = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
        var filterMatch = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
        var queryMatch = !query || text.indexOf(query) !== -1;
        var visible = filterMatch && queryMatch;
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        activeFilter = chip.getAttribute("data-filter") || "all";
        chips.forEach(function(item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        applyFilter();
      });
    });
  });
})();
