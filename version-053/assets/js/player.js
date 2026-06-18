import { H as Hls } from './hls.js';

document.querySelectorAll('[data-player]').forEach(function (wrap) {
  var video = wrap.querySelector('video');
  var cover = wrap.querySelector('.player-cover');
  if (!video) {
    return;
  }
  var stream = video.getAttribute('data-stream');
  var started = false;
  var hls = null;

  function attachStream() {
    if (started || !stream) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function playVideo() {
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  video.addEventListener('error', function () {
    if (cover && !video.paused) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
