// assets/script.js
(function () {
  const root = document.documentElement;
  const storageKey = "theme-preference";
  const defaultBodyOverflow = document.body.style.overflow;

  const readStorage = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch (err) {
      return null;
    }
  };

  const writeStorage = (value) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch (err) {
      /* storage might be disabled - ignore */
    }
  };

  const systemPrefersDark = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const applyTheme = (theme, persist = true) => {
    if (theme !== "light" && theme !== "dark") {
      theme = systemPrefersDark() ? "dark" : "light";
    }
    root.setAttribute("data-theme", theme);
    if (persist) {
      writeStorage(theme);
    }
  };

  const storedTheme = readStorage();
  if (storedTheme) {
    applyTheme(storedTheme, false);
  }

  const updateMetaTheme = (theme) => {
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach((tag) => {
      const media = tag.getAttribute("media");
      if (!media || media.includes(theme)) {
        tag.setAttribute("content", getComputedStyle(document.body).backgroundColor);
      }
    });
  };

  updateMetaTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  const toggleTheme = () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    updateMetaTheme(next);
  };

  document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });

  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const stored = readStorage();
        if (!stored || stored === "system") {
          applyTheme(event.matches ? "dark" : "light", false);
          updateMetaTheme(event.matches ? "dark" : "light");
        }
      });
  }

  const navToggle = document.querySelector('[data-action="toggle-nav"]');
  const nav = document.querySelector("[data-nav]");

  const closeNav = () => {
    if (!nav || !navToggle) {
      return;
    }
    const wasOpen = nav.classList.contains("is-open");
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    if (wasOpen) {
      document.body.classList.remove("is-nav-open");
    }
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("is-nav-open", isOpen);
      if (isOpen) {
        const firstLink = nav.querySelector("a");
        if (firstLink) {
          firstLink.focus({ preventScroll: true });
        }
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });
  }

  const mapElements = Array.from(document.querySelectorAll(".js-delivery-map"));

  const loadLeaflet = () =>
    new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.defer = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });

  const initMap = (element) => {
    if (!window.L || !element) {
      return;
    }

    const lat = parseFloat(element.dataset.centerLat);
    const lng = parseFloat(element.dataset.centerLng);
    const tiers = JSON.parse(element.dataset.tiers || "[]");
    const city = element.dataset.city || "Centre";

    const map = L.map(element, { scrollWheelZoom: false }).setView([lat, lng], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<strong>${city}</strong> - centre des zones`);

    const defaultColors = ["#ef4444", "#facc15", "#2563eb", "#f97316"];
    const tiersWithDefaults = tiers.map((tier, index) => ({
      ...tier,
      __defaultColor: defaultColors[index % defaultColors.length],
    }));
    const sortedTiers = tiersWithDefaults.slice().sort((a, b) => b.radius_km - a.radius_km);

    let largestBounds = null;

    sortedTiers.forEach((tier, index) => {
      const color = tier.color || tier.__defaultColor;
      const circle = L.circle([lat, lng], {
        radius: tier.radius_km * 1000,
        color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 1.4,
      }).addTo(map);
      const contactNote = tier.contact_note || "Contactez-moi pour plus d’informations.";
      const popupHtml = `<strong>${tier.label}</strong><br>${tier.radius_km} km - ${tier.price_eur} €<br><em>${contactNote}</em>`;
      circle.bindPopup(popupHtml);
      if (index === 0) {
        largestBounds = circle.getBounds();
      }
    });

    if (largestBounds) {
      map.fitBounds(largestBounds, { padding: [28, 28] });
    }
  };

  if (mapElements.length) {
    mapElements.forEach((element) => {
      const observer = new IntersectionObserver(
        async (entries, obs) => {
          const isVisible = entries.some((entry) => entry.isIntersecting);
          if (!isVisible) {
            return;
          }
          obs.disconnect();
          await loadLeaflet();
          initMap(element);
        },
        { threshold: 0.12 }
      );

      observer.observe(element);
    });
  }

  const initialiseCarousel = (carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".media-card__slide"));
    if (!slides.length) return;

    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");
    const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const images = slides
      .map((slide) => slide.querySelector("img"))
      .filter((img) => Boolean(img));
    let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (index < 0) index = 0;

    const setActive = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle("is-active", idx === index);
      });
      dots.forEach((dot, idx) => {
        dot.classList.toggle("is-active", idx === index);
        dot.setAttribute("aria-pressed", idx === index ? "true" : "false");
      });
    };

    prevBtn?.addEventListener("click", () => setActive(index - 1));
    nextBtn?.addEventListener("click", () => setActive(index + 1));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const targetIndex = Number(dot.dataset.index || 0);
        setActive(targetIndex);
      });
    });
    images.forEach((img) => {
      img.addEventListener("click", () => toggleLightbox(true, img.src, img.alt));
    });
  };

  let lightboxEl;
  let lightboxImg;

  const ensureLightbox = () => {
    if (lightboxEl) return;
    lightboxEl = document.createElement("div");
    lightboxEl.className = "media-lightbox";
    lightboxEl.innerHTML = `
      <div class="media-lightbox__content">
        <button class="media-lightbox__close" type="button" aria-label="Fermer l'image">&times;</button>
        <img src="" alt="">
      </div>
    `;
    lightboxImg = lightboxEl.querySelector("img");
    const closeBtn = lightboxEl.querySelector(".media-lightbox__close");
    closeBtn.addEventListener("click", () => toggleLightbox(false));
    lightboxEl.addEventListener("click", (event) => {
      if (event.target === lightboxEl) {
        toggleLightbox(false);
      }
    });
    document.body.appendChild(lightboxEl);
  };

  const toggleLightbox = (show, src = "", alt = "") => {
    ensureLightbox();
    if (show) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightboxEl.classList.add("is-active");
      document.body.style.overflow = "hidden";
    } else {
      lightboxEl.classList.remove("is-active");
      lightboxImg.src = "";
      if (modal && !modal.hasAttribute("hidden")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = defaultBodyOverflow;
      }
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightboxEl?.classList.contains("is-active")) {
      toggleLightbox(false);
    }
  });

  document.querySelectorAll("[data-carousel]").forEach(initialiseCarousel);

  const initShowcaseCarousel = (container) => {
    if (!container || container.dataset.carouselInitialised === "true") {
      return;
    }
    const track = container.querySelector("[data-carousel-track]");
    const viewport = container.querySelector("[data-carousel-viewport]") || track;
    const slides = Array.from(track?.querySelectorAll("[data-showcase-slide]") || []);
    const prevBtn = container.querySelector("[data-carousel-prev]");
    const nextBtn = container.querySelector("[data-carousel-next]");
    const dotsWrapper = container.querySelector("[data-carousel-dots]");
    const dots = Array.from(dotsWrapper?.querySelectorAll("[data-carousel-dot]") || []);
    const progressBar = container.querySelector("[data-carousel-progress]");
    const hostSection = container.closest(".action-showcase");

    if (!track || !slides.length) {
      container.classList.add("is-static");
      hostSection?.classList.add("is-static");
      return;
    }

    container.dataset.carouselInitialised = "true";
    container.classList.remove("is-static");
    hostSection?.classList.remove("is-static");

    let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (index < 0) {
      index = 0;
    }
    const autoplayDelay = Number.parseInt(container.dataset.autoplay || "0", 10);
    const autoplayEnabled =
      Number.isFinite(autoplayDelay) && autoplayDelay >= 1200 && slides.length > 1;
    let rafId = null;
    let progressTime = 0;
    let lastTimestamp = 0;
    let isPaused = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;
    let dragMoved = false;
    let tapImage = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const setProgress = (ratio) => {
      if (!progressBar) {
        return;
      }
      progressBar.style.setProperty("--progress", clamp(ratio, 0, 1));
    };

    const updateSlides = (target, { immediate = false } = {}) => {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      const offset = -index * 100;
      if (immediate) {
        track.style.transition = "none";
        track.style.transform = `translate3d(${offset}%, 0, 0)`;
        requestAnimationFrame(() => {
          track.style.transition = "";
        });
      } else {
        track.style.transform = `translate3d(${offset}%, 0, 0)`;
      }
      slides.forEach((slide, idx) => {
        const active = idx === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.setAttribute("tabindex", active ? "0" : "-1");
      });
      dots.forEach((dot, idx) => {
        const active = idx === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", active ? "true" : "false");
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
      progressTime = 0;
      setProgress(0);
    };

    if (slides.length <= 1) {
      updateSlides(index, { immediate: true });
      container.classList.add("is-static");
      hostSection?.classList.add("is-static");
      dotsWrapper?.setAttribute("hidden", "true");
      if (progressBar?.parentElement) {
        progressBar.parentElement.setAttribute("hidden", "true");
      }
      prevBtn?.setAttribute("hidden", "true");
      nextBtn?.setAttribute("hidden", "true");
      return;
    }

    if (!autoplayEnabled && progressBar?.parentElement) {
      progressBar.parentElement.setAttribute("hidden", "true");
    } else if (progressBar?.parentElement) {
      progressBar.parentElement.removeAttribute("hidden");
    }
    dotsWrapper?.removeAttribute("hidden");
    prevBtn?.removeAttribute("hidden");
    nextBtn?.removeAttribute("hidden");

    const goTo = (target, options = {}) => {
      updateSlides(target, options);
      if (autoplayEnabled) {
        progressTime = 0;
        lastTimestamp = 0;
      }
    };

    const tick = (timestamp) => {
      if (!autoplayEnabled) {
        return;
      }
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }
      if (isPaused || isDragging) {
        lastTimestamp = timestamp;
        rafId = requestAnimationFrame(tick);
        return;
      }
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      progressTime += delta;
      const ratio = progressTime / autoplayDelay;
      setProgress(ratio);
      if (progressTime >= autoplayDelay) {
        progressTime = 0;
        setProgress(0);
        updateSlides(index + 1);
      }
      rafId = requestAnimationFrame(tick);
    };

    const startAutoplay = () => {
      if (!autoplayEnabled) {
        return;
      }
      cancelAnimationFrame(rafId);
      progressTime = 0;
      lastTimestamp = 0;
      setProgress(0);
      rafId = requestAnimationFrame(tick);
    };

    const pauseAutoplay = () => {
      if (!autoplayEnabled) {
        return;
      }
      isPaused = true;
    };

    const resumeAutoplay = () => {
      if (!autoplayEnabled) {
        return;
      }
      isPaused = false;
      lastTimestamp = 0;
    };

    prevBtn?.addEventListener("click", () => {
      goTo(index - 1);
    });
    nextBtn?.addEventListener("click", () => {
      goTo(index + 1);
    });
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const targetIndex = Number.parseInt(dot.dataset.index || "0", 10);
        goTo(targetIndex);
      });
    });

    container.addEventListener("mouseenter", pauseAutoplay);
    container.addEventListener("mouseleave", () => {
      resumeAutoplay();
    });
    container.addEventListener("focusin", pauseAutoplay);
    container.addEventListener("focusout", (event) => {
      if (!container.contains(event.relatedTarget)) {
        resumeAutoplay();
      }
    });

    container.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      }
    });

    const releasePointer = (event) => {
      if (!(viewport && viewport.releasePointerCapture)) {
        return;
      }
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch (err) {
        /* ignore */
      }
    };

    const onPointerDown = (event) => {
      if (!viewport) {
        return;
      }
      if (event.target.closest("[data-showcase-zoom]")) {
        return;
      }
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      isDragging = true;
      dragMoved = false;
      dragStartX = event.clientX;
      dragCurrentX = dragStartX;
      const slide = event.target.closest("[data-showcase-slide]");
      tapImage = slide?.querySelector("img") || null;
      if (viewport.setPointerCapture) {
        try {
          viewport.setPointerCapture(event.pointerId);
        } catch (err) {
          /* ignore */
        }
      }
      track.style.transition = "none";
      pauseAutoplay();
    };

    const onPointerMove = (event) => {
      if (!isDragging || !viewport) {
        return;
      }
      dragCurrentX = event.clientX;
      const deltaX = dragCurrentX - dragStartX;
      if (!dragMoved && Math.abs(deltaX) > 6) {
        dragMoved = true;
      }
      const width = viewport.clientWidth || 1;
      const offsetPercent = -index * 100 + (deltaX / width) * 100;
      track.style.transform = `translate3d(${offsetPercent}%, 0, 0)`;
    };

    const onPointerUp = (event) => {
      if (!isDragging || !viewport) {
        return;
      }
      isDragging = false;
      releasePointer(event);
      const deltaX = dragCurrentX - dragStartX;
      const width = viewport.clientWidth || 1;
      const threshold = width * 0.18;
      const absDelta = Math.abs(deltaX);
      track.style.transition = "";
      if (dragMoved && absDelta > threshold) {
        goTo(index + (deltaX < 0 ? 1 : -1));
      } else {
        updateSlides(index, { immediate: true });
        if (!dragMoved && tapImage) {
          const src = tapImage.currentSrc || tapImage.src || "";
          const alt = tapImage.alt || "";
          if (src) {
            toggleLightbox(true, src, alt);
          }
        }
      }
      dragMoved = false;
      dragStartX = 0;
      dragCurrentX = 0;
      tapImage = null;
      resumeAutoplay();
    };

    const onPointerCancel = (event) => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      releasePointer(event);
      updateSlides(index, { immediate: true });
      dragMoved = false;
      tapImage = null;
      resumeAutoplay();
    };

    if (viewport) {
      viewport.style.touchAction = "pan-y";
      viewport.addEventListener("pointerdown", onPointerDown);
      viewport.addEventListener("pointermove", onPointerMove);
      viewport.addEventListener("pointerup", onPointerUp);
      viewport.addEventListener("pointerleave", onPointerCancel);
      viewport.addEventListener("pointercancel", onPointerCancel);
    }

    updateSlides(index, { immediate: true });
    startAutoplay();
  };

  document.querySelectorAll("[data-showcase-carousel]").forEach(initShowcaseCarousel);

  document.querySelectorAll("[data-fullscreen-src]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-fullscreen-src");
      const alt = btn.getAttribute("data-fullscreen-alt") || "";
      toggleLightbox(true, src, alt);
    });
  });

  const packCardRegistry = new Set();
  const packDesktopQuery = window.matchMedia("(min-width: 960px)");

  const setPackState = (card, expanded) => {
    card.dataset.packOpen = expanded ? "true" : "false";
    const toggle = card.querySelector("[data-pack-toggle]");
    const label = toggle?.querySelector("[data-pack-toggle-label]");
    const content = card.querySelector("[data-pack-content]");
    if (toggle) {
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (label) {
        label.textContent = expanded ? "Masquer le détail" : "Voir le détail";
      }
    }
    if (content) {
      content.setAttribute("aria-hidden", expanded ? "false" : "true");
    }
  };

  const syncCardWithViewport = (card, matches) => {
    const toggle = card.querySelector("[data-pack-toggle]");
    const shouldExpand = matches || !toggle;
    setPackState(card, shouldExpand);
  };

  const syncAllPackCards = (matches) => {
    packCardRegistry.forEach((card) => {
      syncCardWithViewport(card, matches);
    });
  };

  const initialisePackCards = (cards) => {
    cards.forEach((card) => {
      if (!card || card.dataset.packInitialised === "true") {
        return;
      }
      card.dataset.packInitialised = "true";
      packCardRegistry.add(card);
      const toggle = card.querySelector("[data-pack-toggle]");
      if (!toggle) {
        setPackState(card, true);
        return;
      }
      toggle.addEventListener("click", () => {
        const isExpanded = card.dataset.packOpen === "true";
        setPackState(card, !isExpanded);
      });
    });
    const matches = packDesktopQuery.matches;
    cards.forEach((card) => syncCardWithViewport(card, matches));
  };

  initialisePackCards(Array.from(document.querySelectorAll("[data-pack-card]")));
  packDesktopQuery.addEventListener("change", (event) => {
    syncAllPackCards(event.matches);
  });

  const initialisePackSlider = (slider) => {
    const track = slider.querySelector("[data-pack-track]");
    const viewport = slider.querySelector("[data-pack-viewport]");
    const prevBtn = slider.querySelector("[data-pack-prev]");
    const nextBtn = slider.querySelector("[data-pack-next]");
    const dotsContainer = slider.querySelector("[data-pack-dots]");
    if (!track || !viewport) {
      return;
    }

    const slides = Array.from(track.children);
    const totalSlides = slides.length;
    const defaultVisible = Math.max(1, Number(slider.dataset.slidesVisible || "3"));
    const isFinite = slider.classList.contains("pack-slider--finite");

    if (totalSlides <= 1) {
      slider.classList.add("is-static");
      if (dotsContainer) {
        dotsContainer.hidden = true;
      }
      return;
    }

    if (isFinite) {
      let currentIndex = 0;
      let visibleCount = defaultVisible;
      let maxIndex = 0;

      track.style.transition = "none";
      track.style.transform = "translateX(0)";

      const getVisibleCount = () => {
        if (window.innerWidth <= 720) {
          return 1;
        }
        if (window.innerWidth <= 1100) {
          return Math.min(2, totalSlides);
        }
        return Math.min(defaultVisible, totalSlides);
      };

      const clampIndex = (index) => Math.max(0, Math.min(index, maxIndex));

      const updateDots = () => {
        if (!dotsContainer) {
          return;
        }
        dotsContainer.querySelectorAll(".pack-slider__dot").forEach((dot) => {
          const idx = Number(dot.dataset.index || "0");
          dot.classList.toggle("is-active", idx === currentIndex);
        });
      };

      const updateControls = () => {
        const hasRange = maxIndex > 0;
        slider.classList.toggle("is-static", !hasRange);
        if (prevBtn) {
          const disabled = !hasRange || currentIndex === 0;
          prevBtn.disabled = disabled;
          prevBtn.setAttribute("aria-disabled", disabled ? "true" : "false");
          prevBtn.hidden = !hasRange;
        }
        if (nextBtn) {
          const disabled = !hasRange || currentIndex === maxIndex;
          nextBtn.disabled = disabled;
          nextBtn.setAttribute("aria-disabled", disabled ? "true" : "false");
          nextBtn.hidden = !hasRange;
        }
        if (dotsContainer) {
          dotsContainer.hidden = maxIndex < 1;
        }
      };

      const rebuildDots = () => {
        if (!dotsContainer) {
          return;
        }
        dotsContainer.innerHTML = "";
        if (maxIndex < 1) {
          dotsContainer.hidden = true;
          return;
        }
        for (let i = 0; i <= maxIndex; i++) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "pack-slider__dot";
          dot.dataset.index = String(i);
          dot.setAttribute("aria-label", `Afficher le pack ${i + 1}`);
          dot.addEventListener("click", () => {
            goToIndex(i);
          });
          dotsContainer.appendChild(dot);
        }
        dotsContainer.hidden = false;
        updateDots();
      };

      let programmaticTarget = 0;
      let isProgrammaticScroll = false;
      let scrollRaf = 0;
      let resizeRaf = 0;

      const scrollToIndex = (index, { smooth = true } = {}) => {
        const targetSlide = slides[index];
        if (!targetSlide) {
          return;
        }
        const offset = targetSlide.offsetLeft;
        if (smooth) {
          programmaticTarget = index;
          isProgrammaticScroll = true;
          viewport.scrollTo({ left: offset, behavior: "smooth" });
        } else {
          viewport.scrollLeft = offset;
          programmaticTarget = index;
          isProgrammaticScroll = false;
        }
      };

      const syncFromScroll = () => {
        const scrollLeft = viewport.scrollLeft;
        let nearestIndex = currentIndex;
        let smallestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i <= maxIndex; i++) {
          const slide = slides[i];
          if (!slide) {
            continue;
          }
          const distance = Math.abs(slide.offsetLeft - scrollLeft);
          if (distance < smallestDistance) {
            smallestDistance = distance;
            nearestIndex = i;
          }
        }
        if (nearestIndex !== currentIndex) {
          currentIndex = nearestIndex;
          updateControls();
          updateDots();
        }
        if (isProgrammaticScroll && nearestIndex === programmaticTarget && smallestDistance <= 1) {
          isProgrammaticScroll = false;
        }
      };

      const goToIndex = (target, { smooth = true } = {}) => {
        const clamped = clampIndex(target);
        currentIndex = clamped;
        updateControls();
        updateDots();
        scrollToIndex(clamped, { smooth });
      };

      const goToNext = () => {
        goToIndex(currentIndex + 1);
      };

      const goToPrev = () => {
        goToIndex(currentIndex - 1);
      };

      if (prevBtn) {
        prevBtn.addEventListener("click", () => goToPrev());
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => goToNext());
      }

      const handleScroll = () => {
        if (scrollRaf) {
          cancelAnimationFrame(scrollRaf);
        }
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          syncFromScroll();
        });
      };

      viewport.addEventListener("scroll", handleScroll, { passive: true });

      const recalculateLayout = () => {
        visibleCount = getVisibleCount();
        maxIndex = Math.max(0, totalSlides - visibleCount);
        currentIndex = clampIndex(currentIndex);
        rebuildDots();
        updateControls();
        updateDots();
        scrollToIndex(currentIndex, { smooth: false });
      };

      const handleResize = () => {
        if (resizeRaf) {
          cancelAnimationFrame(resizeRaf);
        }
        resizeRaf = requestAnimationFrame(() => {
          recalculateLayout();
        });
      };

      window.addEventListener("resize", handleResize);

      recalculateLayout();
      return;
    }

    if (totalSlides <= defaultVisible) {
      slider.classList.add("is-static");
      if (dotsContainer) {
        dotsContainer.hidden = true;
      }
      return;
    }

    let order = slides.map((_, idx) => idx);
    let isAnimating = false;
    let slideOffset = 0;

    const computeOffset = () => {
      const first = track.children[0];
      const second = track.children[1];
      if (!first) {
        slideOffset = 0;
        return;
      }
      const firstRect = first.getBoundingClientRect();
      if (second) {
        const secondRect = second.getBoundingClientRect();
        slideOffset = secondRect.left - firstRect.left;
      } else {
        slideOffset = firstRect.width;
      }
    };

    const resetTransform = () => {
      computeOffset();
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      requestAnimationFrame(() => {
        track.style.transition = "transform 0.5s ease";
      });
    };

    const updateDots = () => {
      if (!dotsContainer) {
        return;
      }
      dotsContainer.querySelectorAll(".pack-slider__dot").forEach((dot) => {
        const idx = Number(dot.dataset.index || "0");
        dot.classList.toggle("is-active", order[0] === idx);
      });
    };

    const createDots = () => {
      if (!dotsContainer) {
        return;
      }
      dotsContainer.innerHTML = "";
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "pack-slider__dot";
        dot.dataset.index = String(i);
        dot.setAttribute("aria-label", `Afficher le pack ${i + 1}`);
        dot.addEventListener("click", () => {
          goToIndex(i);
        });
        dotsContainer.appendChild(dot);
      }
      updateDots();
    };

    const shiftForward = () => {
      const firstChild = track.firstElementChild;
      if (!firstChild) {
        return;
      }
      track.appendChild(firstChild);
      order.push(order.shift());
    };

    const shiftBackward = () => {
      const lastChild = track.lastElementChild;
      if (!lastChild) {
        return;
      }
      track.insertBefore(lastChild, track.firstElementChild);
      order.unshift(order.pop());
    };

    const goToNext = () => {
      if (isAnimating) {
        return;
      }
      isAnimating = true;
      computeOffset();
      track.style.transition = "transform 0.5s ease";
      track.style.transform = `translateX(-${slideOffset}px)`;
      const handleTransitionEnd = (event) => {
        if (event.propertyName !== "transform") {
          return;
        }
        track.removeEventListener("transitionend", handleTransitionEnd);
        track.style.transition = "none";
        shiftForward();
        track.style.transform = "translateX(0)";
        requestAnimationFrame(() => {
          track.style.transition = "transform 0.5s ease";
        });
        isAnimating = false;
        updateDots();
      };
      track.addEventListener("transitionend", handleTransitionEnd);
    };

    const goToPrev = () => {
      if (isAnimating) {
        return;
      }
      isAnimating = true;
      track.style.transition = "none";
      shiftBackward();
      computeOffset();
      track.style.transform = `translateX(-${slideOffset}px)`;
      requestAnimationFrame(() => {
        track.style.transition = "transform 0.5s ease";
        track.style.transform = "translateX(0)";
      });
      const handleTransitionEnd = (event) => {
        if (event.propertyName !== "transform") {
          return;
        }
        track.removeEventListener("transitionend", handleTransitionEnd);
        isAnimating = false;
        updateDots();
      };
      track.addEventListener("transitionend", handleTransitionEnd);
    };

    const goToIndex = (targetIndex) => {
      if (isAnimating) {
        return;
      }
      if (order[0] === targetIndex) {
        return;
      }
      const currentPosition = order.indexOf(targetIndex);
      if (currentPosition === -1) {
        return;
      }
      const forwardSteps = currentPosition;
      const backwardSteps = order.length - currentPosition;
      if (forwardSteps <= backwardSteps) {
        for (let i = 0; i < forwardSteps; i++) {
          shiftForward();
        }
      } else {
        for (let i = 0; i < backwardSteps; i++) {
          shiftBackward();
        }
      }
      resetTransform();
      updateDots();
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", goToPrev);
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", goToNext);
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchGesture = false;

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) {
        return;
      }
      touchGesture = false;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      if (event.touches.length !== 1) {
        return;
      }
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;
      if (!touchGesture && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        touchGesture = true;
      }
      if (touchGesture) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event) => {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) {
        return;
      }
      const deltaX = touch.clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        if (deltaX < 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
      touchGesture = false;
    };

    viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
    viewport.addEventListener("touchcancel", () => {
      touchGesture = false;
    }, { passive: true });

    window.addEventListener("resize", () => {
      resetTransform();
    });

    createDots();
    resetTransform();
  };

  document.querySelectorAll("[data-pack-slider]").forEach(initialisePackSlider);


  const modal = document.querySelector("[data-media-modal]");
  if (modal) {
    const titleEl = modal.querySelector("[data-media-title]");
    const galleryEl = modal.querySelector("[data-media-gallery]");
    const summaryEl = modal.querySelector("[data-media-summary]");
    const detailsEl = modal.querySelector("[data-media-details]");
    const specsEl = modal.querySelector("[data-media-specs]");
    const closeEls = modal.querySelectorAll("[data-media-close]");
    const openButtons = document.querySelectorAll('[data-action="open-showcase"]');
    const backdropEl = modal.querySelector(".media-modal__backdrop");
    const originalBodyOverflow = document.body.style.overflow;

    const closeModal = () => {
      modal.setAttribute("hidden", "");
      galleryEl.innerHTML = "";
      if (summaryEl) summaryEl.textContent = "";
      if (detailsEl) detailsEl.innerHTML = "";
      if (specsEl) specsEl.innerHTML = "";
      document.body.style.overflow = originalBodyOverflow;
      if (lightboxEl?.classList.contains("is-active")) {
        toggleLightbox(false);
      }
    };

    closeEls.forEach((btn) => btn.addEventListener("click", closeModal));

    backdropEl?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeModal();
      }
    });

    openButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const rawPhotos = button.getAttribute("data-showcase-photos") || "[]";
        let photos = [];
        try {
          photos = JSON.parse(rawPhotos);
        } catch (err) {
          photos = [];
        }
        galleryEl.innerHTML = "";
        photos.forEach((photo) => {
          const figure = document.createElement("figure");
          const img = document.createElement("img");
          img.src = photo.src;
          img.alt = photo.alt || button.getAttribute("data-showcase-title") || "Photo de matériel";
          img.addEventListener("click", () => toggleLightbox(true, img.src, img.alt));
          figure.appendChild(img);
          if (photo.caption) {
            const figcap = document.createElement("figcaption");
            figcap.textContent = photo.caption;
            figure.appendChild(figcap);
          }
          galleryEl.appendChild(figure);
        });
        titleEl.textContent = button.getAttribute("data-showcase-title") || "Galerie média";
        const summaryText = button.getAttribute("data-showcase-summary") || "";
        if (summaryEl) {
          summaryEl.textContent = summaryText;
          summaryEl.hidden = !summaryText.trim();
        }
        const rawDetails = button.getAttribute("data-showcase-details") || "[]";
        const rawSpecs = button.getAttribute("data-showcase-specs") || "[]";
        let detailSections = [];
        let specs = [];
        try {
          detailSections = JSON.parse(rawDetails);
        } catch (err) {
          detailSections = [];
        }
        if (!Array.isArray(detailSections)) {
          detailSections = [];
        }
        try {
          specs = JSON.parse(rawSpecs);
        } catch (err) {
          specs = [];
        }
        if (!Array.isArray(specs)) {
          specs = [];
        }
        if (detailsEl) {
          detailsEl.innerHTML = "";
          detailSections.forEach((detail) => {
            if (!detail || (!detail.title && !detail.text)) return;
            const block = document.createElement("div");
            if (detail.title) {
              const h4 = document.createElement("h4");
              h4.textContent = detail.title;
              block.appendChild(h4);
            }
            if (detail.text) {
              const paragraph = document.createElement("p");
              paragraph.textContent = detail.text;
              block.appendChild(paragraph);
            }
            detailsEl.appendChild(block);
          });
          detailsEl.hidden = !detailsEl.innerHTML.trim();
        }
        if (specsEl) {
          specsEl.innerHTML = "";
          specs.forEach((spec) => {
            if (!spec) return;
            const li = document.createElement("li");
            li.textContent = spec;
            specsEl.appendChild(li);
          });
          specsEl.hidden = !specs.length;
        }
        modal.removeAttribute("hidden");
        document.body.style.overflow = "hidden";
      });
    });
  }
})();


/* ===== Catalogue: recherche, filtres, carousel, vidéo ===== */
(function () {
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

  const grid = $('#catGrid');
  if (!grid) return;

  const search = $('#catSearch');
  const chips  = $$('#catFilters .chip');
  const cards = $$('#catGrid .card');
  const dividers = $$('#catGrid [data-category-divider]');

  function applyFilters() {
    const q = (search?.value || '').trim().toLowerCase();
    const active = chips.find(c => c.classList.contains('is-active'));
    const cat = active ? active.dataset.filter.toLowerCase() : '*';

    let visibleCount = 0;
    const visibleByCategory = {};
    cards.forEach(card => {
      const inCat = (cat === '*') || (card.dataset.category === cat);
      const text = (card.dataset.title + ' ' + card.dataset.model + ' ' + card.dataset.tags).toLowerCase();
      const inSearch = q === '' || text.includes(q);
      const show = inCat && inSearch;
      card.style.display = show ? '' : 'none';
      if (show) {
        visibleCount++;
        const slug = card.dataset.category;
        visibleByCategory[slug] = (visibleByCategory[slug] || 0) + 1;
      }
    });

    dividers.forEach(divider => {
      const slug = divider.dataset.category;
      divider.hidden = !visibleByCategory[slug];
    });

    grid.classList.toggle('is-empty', visibleCount === 0);
  }

  // Filtres
  chips.forEach(chip => chip.addEventListener('click', e => {
    chips.forEach(c => c.classList.remove('is-active'));
    e.currentTarget.classList.add('is-active');
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);

  // Carousels
  $$('.carousel').forEach(carousel => {
    const track = $('.carousel-track', carousel);
    const slides = $$('.slide', track);
    if (!slides.length) return;

    const prev = $('.prev', carousel);
    const next = $('.next', carousel);
    let index = 0;

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      carousel.dataset.index = index;
    }
    prev?.addEventListener('click', () => go(index - 1));
    next?.addEventListener('click', () => go(index + 1));

    // Swipe mobile
    let sx = 0;
    let sy = 0;
    let isDragging = false;
    track.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      isDragging = false;
    }, {passive: true});
    track.addEventListener('touchmove', e => {
      if (e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - sx;
      const dy = e.touches[0].clientY - sy;
      if (!isDragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        isDragging = true;
      }
      if (isDragging) {
        e.preventDefault();
      }
    }, {passive: false});
    const finishSwipe = e => {
      if (!e.changedTouches || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) {
        go(index + (dx < 0 ? 1 : -1));
      }
      isDragging = false;
    };
    track.addEventListener('touchend', finishSwipe, {passive: true});
    track.addEventListener('touchcancel', () => { isDragging = false; }, {passive: true});
  });

  // Dialog vidéo (lazy YouTube)
  const dialog = $('#ytDialog');
  const frame  = $('#ytFrame');
  function openVideo(src) {
    const url = new URL(src, window.location.origin);
    if (!/youtube\.com|youtu\.be/.test(url.href)) return window.open(src, '_blank');
    const embed = src
      .replace('watch?v=','embed/')
      .replace('youtu.be/','www.youtube.com/embed/');
    frame.src = embed + (embed.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
    dialog.showModal();
  }
  $('.yt-close', dialog)?.addEventListener('click', () => { frame.src = ''; dialog.close(); });
  dialog?.addEventListener('cancel', () => { frame.src = ''; });

  $$('.video-thumb').forEach(btn => btn.addEventListener('click', () => openVideo(btn.dataset.youtube)));
  $$('.open-video').forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    openVideo(a.href);
  }));

  // Détails pliables sur les cartes
  $$('.card [data-action="toggle-details"]').forEach((btn) => {
    const targetId = btn.dataset.target;
    if (!targetId) {
      return;
    }
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    const labelOpen = btn.dataset.labelOpen || btn.textContent.trim() || 'Voir les détails';
    const labelClose = btn.dataset.labelClose || 'Masquer les détails';
    btn.dataset.labelOpen = labelOpen;
    btn.dataset.labelClose = labelClose;
    btn.textContent = labelOpen;
    target.hidden = true;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !expanded;
      btn.setAttribute('aria-expanded', String(nextExpanded));
      btn.textContent = nextExpanded ? labelClose : labelOpen;
      target.hidden = !nextExpanded;
      target.classList.toggle('is-open', nextExpanded);
    });
  });

  // Première application
  applyFilters();
})();
