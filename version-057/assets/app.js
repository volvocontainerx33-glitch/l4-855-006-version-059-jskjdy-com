(function () {
    var navButton = document.querySelector('[data-menu-toggle]');
    var navPanel = document.querySelector('[data-nav-panel]');

    if (navButton && navPanel) {
        navButton.addEventListener('click', function () {
            navPanel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dotsWrap = slider.querySelector('[data-hero-dots]');
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function renderDots() {
            if (!dotsWrap) {
                return;
            }
            dotsWrap.innerHTML = '';
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换推荐');
                if (index === current) {
                    dot.classList.add('is-active');
                }
                dot.addEventListener('click', function () {
                    show(index);
                    restart();
                });
                dotsWrap.appendChild(dot);
            });
        }

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            renderDots();
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initFilters() {
        var search = document.querySelector('[data-card-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
        var empty = document.querySelector('[data-empty-state]');
        var activeCategory = 'all';

        if (!cards.length) {
            return;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var query = normalize(search ? search.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var category = card.getAttribute('data-category') || '';
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = activeCategory === 'all' || category === activeCategory;
                var shouldShow = matchQuery && matchCategory;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (search) {
            search.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                activeCategory = button.getAttribute('data-filter-value') || 'all';
                apply();
            });
        });

        apply();
    }

    function initPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('.video-box'));

        boxes.forEach(function (box) {
            var video = box.querySelector('.site-video');
            var overlay = box.querySelector('[data-video-button]');
            var panel = box.closest('.player-panel');
            var sourceButtons = panel ? Array.prototype.slice.call(panel.querySelectorAll('[data-video-select]')) : [];

            if (!video) {
                return;
            }

            function load(url, autoplay) {
                if (!url) {
                    return;
                }

                if (video._hlsPlayer) {
                    video._hlsPlayer.destroy();
                    video._hlsPlayer = null;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (autoplay) {
                            video.play().catch(function () {});
                        }
                    });
                    video._hlsPlayer = hls;
                } else {
                    video.src = url;
                    if (autoplay) {
                        video.play().catch(function () {});
                    }
                }

                video.setAttribute('data-loaded', 'true');
            }

            function start(url) {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                load(url || video.getAttribute('data-video'), true);
            }

            if (overlay) {
                overlay.addEventListener('click', function () {
                    start(video.getAttribute('data-video'));
                });
            }

            video.addEventListener('click', function () {
                if (!video.getAttribute('data-loaded')) {
                    start(video.getAttribute('data-video'));
                    return;
                }

                if (video.paused) {
                    video.play().catch(function () {});
                }
            });

            sourceButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    sourceButtons.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    button.classList.add('active');
                    video.setAttribute('data-video', button.getAttribute('data-video-select') || '');
                    start(video.getAttribute('data-video'));
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
        initPlayers();
    });
})();
