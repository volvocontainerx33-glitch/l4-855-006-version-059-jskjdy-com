function initMoviePlayer(source) {
  var video = document.getElementById("movie-video");
  var overlay = document.querySelector(".player-overlay");
  var trigger = document.querySelector(".play-trigger");
  var hls = null;
  var loaded = false;

  if (!video || !source) {
    return;
  }

  function bindSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      loaded = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        autoStartLoad: true,
        capLevelToPlayerSize: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      loaded = true;
      return;
    }

    video.src = source;
    loaded = true;
  }

  function play() {
    bindSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener("click", play);
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      play();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
