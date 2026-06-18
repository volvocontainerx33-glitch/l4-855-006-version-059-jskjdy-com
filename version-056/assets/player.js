(function () {
  function setupPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var started = false;
    var hls = null;
    if (!video) return;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (overlay) overlay.classList.add('is-hidden');
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        playVideo();
        return;
      }

      video.src = config.source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener('click', start);
      overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          start();
        }
      });
    }

    video.addEventListener('click', function () {
      if (!started) start();
    });
  }

  window.SitePlayer = {
    setupPlayer: setupPlayer
  };
}());
