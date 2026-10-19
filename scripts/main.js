(function() {
  "use strict";

  window.addEventListener('load', () => {
    on_page_load()
  });

  /**
   * Function gets called when page is loaded.
   */
  function on_page_load() {
    // Initialize On-scroll Animations
    AOS.init({
      anchorPlacement: 'top-left',
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
      disable: 'mobile'
    });
  }

  /**
   * Navbar effects and scrolltop buttons upon scrolling
   */
  const navbar = document.getElementById('header-nav')
  var body = document.getElementsByTagName("body")[0]
  const scrollTop = document.getElementById('scrolltop')
  window.onscroll = () => {
    if (window.scrollY > 0) {
      navbar.classList.add('fixed-top', 'shadow-sm')
      body.style.paddingTop = navbar.offsetHeight + "px"
      scrollTop.style.visibility = "visible";
      scrollTop.style.opacity = 1;
    } else {
      navbar.classList.remove('fixed-top', 'shadow-sm')
      body.style.paddingTop = "0px"
      scrollTop.style.visibility = "hidden";
      scrollTop.style.opacity = 0;
    }
  };

  /**
   * Masonry Grid
   */
  var elem = document.querySelector('.grid');
  if(elem) {
    imagesLoaded(elem, function() {
      new Masonry(elem, {
        itemSelector: '.grid-item',
        percentPosition: true,
        horizontalOrder: true
      });
    })
  }

  /**
   * Big Picture Popup for images and videos
   */
   document.querySelectorAll("[data-bigpicture]").forEach((function(e) {
     e.addEventListener("click", (function(t){
       t.preventDefault();
       const data =JSON.parse(e.dataset.bigpicture)
       BigPicture({
        el: t.target,
        ...data
      })
     })
    )
  }))

  /**
   * Big Picture Popup for Photo Gallary
   */
  document.querySelectorAll(".bp-gallery a").forEach((function(e) {
    var caption = e.querySelector('figcaption');
    var img = e.querySelector('img');

    img.dataset.caption = '<a class="link-light" target="_blank" href="' + e.href + '">' + caption.innerHTML + '</a>';

    e.addEventListener("click", (function(t) {
        // Ajoutez cette ligne pour rediriger vers le lien spécifié
        window.location.href = e.href;
    }));
}));


  // Add your javascript here

  /**
   * Timeline Parcours — déclenche les animations quand la timeline entre à l'écran
   */
  const eduTimeline = document.querySelector('[data-edu-timeline]');
  if (eduTimeline && 'IntersectionObserver' in window) {
    const eduObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    eduObserver.observe(eduTimeline);
  } else if (eduTimeline) {
    // Fallback : anime immédiatement si IntersectionObserver indisponible
    eduTimeline.classList.add('is-visible');
  }

  /**
   * Navbar — lentille glissante indiquant la section courante.
   * Fonctionne en ligne (desktop) comme en colonne (menu replié mobile) :
   * la lentille se cale sur la position ET la taille du lien actif.
   */
  const navSpy = document.querySelector('[data-navspy]');
  const navLens = navSpy && navSpy.querySelector('.nav-lens');
  const navLinks = navSpy
    ? Array.prototype.slice.call(navSpy.querySelectorAll('.nav-link'))
    : [];

  if (navLens && navLinks.length) {
    const sections = navLinks
      .map(link => {
        const id = (link.getAttribute('href') || '').replace(/^.*#/, '');
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

    let activeLink = null;
    // Le pointeur est sur la navbar : l'observateur ne doit plus bouger la pastille,
    // sinon elle file sous le curseur avant qu'on ait pu cliquer.
    let hovering = false;
    // Verrou pendant le défilement déclenché par un clic sur un lien.
    let locked = false;
    let idleTimer = 0;
    let maxTimer = 0;

    const placeLens = (link) => {
      if (!link || !link.offsetWidth) return;
      const item = link.parentElement;
      // Premier placement : pas de transition, sinon la pastille "vole" depuis l'origine
      const immediate = !navLens.classList.contains('is-ready');
      if (immediate) navLens.style.transition = 'none';
      navLens.style.width = item.offsetWidth + 'px';
      navLens.style.height = item.offsetHeight + 'px';
      navLens.style.transform =
        'translate3d(' + item.offsetLeft + 'px, ' + item.offsetTop + 'px, 0)';
      navLens.classList.add('is-ready');
      if (immediate) {
        void navLens.offsetWidth;
        navLens.style.transition = '';
      }
    };

    const setActive = (link, force) => {
      if (!link) return;
      activeLink = link;
      navLinks.forEach(el => {
        el.classList.toggle('is-active', el === link);
        if (el === link) {
          el.setAttribute('aria-current', 'true');
        } else {
          el.removeAttribute('aria-current');
        }
      });
      // En survol, la pastille reste sous le curseur : on ne la rappelle qu'à la sortie
      if (force || !hovering) placeLens(link);
    };

    const releaseLock = () => {
      locked = false;
      clearTimeout(idleTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('scroll', onLockScroll);
    };

    function onLockScroll() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(releaseLock, 140);
    }

    const lockSpy = () => {
      locked = true;
      clearTimeout(idleTimer);
      clearTimeout(maxTimer);
      window.addEventListener('scroll', onLockScroll, { passive: true });
      idleTimer = setTimeout(releaseLock, 400);  // si le défilement ne démarre pas
      maxTimer = setTimeout(releaseLock, 2500);  // garde-fou
    };

    // Clic : la cible devient active tout de suite et le reste jusqu'à l'arrivée,
    // sans que les sections traversées ne fassent rebondir la pastille.
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        lockSpy();
        setActive(link, true);
      });
    });

    // Survol : la lentille suit le pointeur, puis revient sur la section active
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      navLinks.forEach(link => {
        link.addEventListener('pointerenter', () => placeLens(link));
      });
      navSpy.addEventListener('pointerenter', () => { hovering = true; });
      navSpy.addEventListener('pointerleave', () => {
        hovering = false;
        placeLens(activeLink);
      });
    }

    // Section la plus visible → lien actif
    if (sections.length && 'IntersectionObserver' in window) {
      const ratios = new Map();
      const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        if (locked) return;

        let bestId = null;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (!bestId) return;
        const match = navLinks.filter(
          el => (el.getAttribute('href') || '').endsWith('#' + bestId)
        )[0];
        if (match && match !== activeLink) setActive(match);
      }, { threshold: [0, 0.15, 0.4, 0.75], rootMargin: '-20% 0px -45% 0px' });

      sections.forEach(section => navObserver.observe(section));
    }

    setActive(navLinks[0]);
    // Les polices et le menu repliable changent les dimensions après coup
    window.addEventListener('load', () => placeLens(activeLink));
    window.addEventListener('resize', () => placeLens(activeLink));
    const collapseEl = document.getElementById('navbarSupportedContent');
    if (collapseEl) {
      collapseEl.addEventListener('transitionend', (e) => {
        // transitionend remonte : ignorer celui de la pastille elle-même,
        // sinon chaque survol la renvoie aussitôt sur la section courante.
        if (e.target !== collapseEl) return;
        placeLens(activeLink);
      });
    }
  }

})();