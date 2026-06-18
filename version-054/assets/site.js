(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-nav-toggle]");
    if (header && toggle) {
        toggle.addEventListener("click", function () {
            header.classList.toggle("nav-open");
        });
    }

    document.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("error", function () {
            img.classList.add("is-missing");
        }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
            slide.classList.toggle("is-active", idx === heroIndex);
        });
        dots.forEach(function (dot, idx) {
            dot.classList.toggle("is-active", idx === heroIndex);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                showHero(idx);
                restartHero();
            });
        });

        function restartHero() {
            if (heroTimer) {
                window.clearInterval(heroTimer);
            }
            heroTimer = window.setInterval(function () {
                showHero(heroIndex + 1);
            }, 5200);
        }

        showHero(0);
        restartHero();
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var query = input ? input.value.trim() : "";
            if (query) {
                window.location.href = "./search.html?q=" + encodeURIComponent(query);
            } else {
                window.location.href = "./search.html";
            }
        });
    });

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function setupFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".js-movie-card, .rank-row"));
        var input = document.querySelector("[data-list-search]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var empty = document.querySelector("[data-empty-state]");
        var activeChip = "";

        function getSelectValue(name) {
            var node = selects.find(function (select) {
                return select.getAttribute("data-filter-select") === name;
            });
            return node ? normalize(node.value) : "";
        }

        function apply() {
            var query = normalize(input ? input.value : "");
            var region = getSelectValue("region");
            var type = getSelectValue("type");
            var year = getSelectValue("year");
            var shown = 0;

            cards.forEach(function (card) {
                var data = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" "));
                var ok = true;

                if (query && data.indexOf(query) === -1) {
                    ok = false;
                }
                if (region && normalize(card.getAttribute("data-region")) !== region) {
                    ok = false;
                }
                if (type && normalize(card.getAttribute("data-type")) !== type) {
                    ok = false;
                }
                if (year && normalize(card.getAttribute("data-year")) !== year) {
                    ok = false;
                }
                if (activeChip && data.indexOf(activeChip) === -1) {
                    ok = false;
                }

                card.classList.toggle("hidden-by-filter", !ok);
                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-show", shown === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");
            if (initialQuery) {
                input.value = initialQuery;
            }
        }

        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = normalize(chip.getAttribute("data-filter-chip"));
                if (activeChip === value) {
                    activeChip = "";
                    chip.classList.remove("is-active");
                } else {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    activeChip = value;
                    chip.classList.add("is-active");
                }
                apply();
            });
        });

        apply();
    }

    setupFilters();

    function setupPlayer() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video[data-hls]");
            var button = shell.querySelector("[data-play]");
            var cover = shell.querySelector(".player-cover");
            var message = shell.querySelector(".player-message");
            var hlsInstance = null;
            var started = false;

            if (!video) {
                return;
            }

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add("is-show");
            }

            function hideCover() {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            }

            function tryPlay() {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        if (button) {
                            button.focus();
                        }
                    });
                }
            }

            function start() {
                if (started) {
                    hideCover();
                    tryPlay();
                    return;
                }

                var hlsUrl = video.getAttribute("data-hls");
                if (!hlsUrl) {
                    showMessage("播放加载失败，请刷新重试");
                    return;
                }

                started = true;
                hideCover();

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(hlsUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        tryPlay();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                            return;
                        }
                        showMessage("播放加载失败，请刷新重试");
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = hlsUrl;
                    tryPlay();
                } else {
                    showMessage("播放加载失败，请刷新重试");
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }

            shell.addEventListener("click", function (event) {
                if (event.target === video || event.target.closest("video")) {
                    return;
                }
                start();
            });

            video.addEventListener("play", hideCover);
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    setupPlayer();
})();
