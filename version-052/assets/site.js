(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var noResult = document.querySelector("[data-no-result]");
    var currentFilter = "";

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function update() {
      var keyword = input ? normalize(input.value) : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var filterHit = !currentFilter || text.indexOf(normalize(currentFilter)) !== -1;
        var keywordHit = !keyword || text.indexOf(keyword) !== -1;
        var show = filterHit && keywordHit;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (noResult) {
        noResult.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", update);
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter-value") || "";
        filters.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        update();
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector(".player-video");
  var overlay = document.querySelector(".player-overlay");
  var button = document.querySelector(".player-play");
  var hasAttached = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function attach() {
    if (hasAttached) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
    hasAttached = true;
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      start();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
