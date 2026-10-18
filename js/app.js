(function () {
  'use strict';

  var app = document.getElementById('app');
  var foot = document.getElementById('foot');
  var lb = document.getElementById('lb');
  var lbc = document.getElementById('lbc');

  var S = {};
  var P = [];
  var started = false;
  var ringCleanup = null;

  var tones = ['olive', 'avo', 'blue', 'yellow', 'brown', 'pink'];
  var acc = ['pink', 'blue', 'yellow', 'avo'];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c];
    });
  }

  function slug(value) {
    return String(value || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function pid(project, index) {
    return (index + 1) + '-' + slug(project.title);
  }

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function circ(number) {
    return number <= 20 ? String.fromCharCode(9311 + number) : number;
  }

  function paras(value) {
    return String(value || '').split(/\n\s*\n/)
      .filter(Boolean)
      .map(function (part) {
        return '<p>' + esc(part) + '</p>';
      }).join('');
  }

  function src(project, index) {
    var entry = project.images && project.images[index];
    entry = entry && (entry.image || entry);
    return entry ? String(entry).replace(/^\/+/, '') : '';
  }

  function cap(project, index) {
    var entry = project.images && project.images[index];
    return entry && entry.caption ? entry.caption : '';
  }

  function ph(project, index, imageIndex) {
    var n = index + imageIndex;
    var shapes = [
      '<path d="M90 420V230a110 110 0 0 1 220 0v190z"/>',
      '<circle cx="200" cy="240" r="120"/>',
      '<path d="M80 300c-20-90 60-170 150-150s110 120 60 200-190 60-210-50z"/>',
      '<rect x="90" y="130" width="50" height="290"/>' +
        '<rect x="175" y="190" width="50" height="230"/>' +
        '<rect x="260" y="100" width="50" height="320"/>'
    ];

    return '<svg viewBox="0 0 400 500" role="img" aria-label="' +
      esc(project.title) + '" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="400" height="500" style="fill:var(--' +
      tones[n % 6] + ')"/>' +
      '<g style="fill:var(--' + acc[(n + 1) % 4] +
      ')" transform="rotate(' + (n * 7 - 6) +
      ' 200 250)">' + shapes[n % 4] + '</g>' +
      '<circle cx="320" cy="90" r="22" style="fill:var(--soft)"/>' +
      '</svg>';
  }

  function art(project, index, imageIndex) {
    var image = src(project, imageIndex);

    if (!image) return ph(project, index, imageIndex);

    return '<img src="' + esc(image) + '" alt="' +
      esc(project.title) + ', image ' + (imageIndex + 1) +
      '" loading="lazy">';
  }

  function items(category) {
    return P.map(function (project, index) {
      return [project, index];
    }).filter(function (item) {
      return !category || category === 'All' ||
        item[0].category === category;
    });
  }

  /* ======================================
     3D ARCHIVE RING
     ====================================== */

  function lib(list) {
    if (!list.length) {
      return '<p class="txt">no projects in this category yet.</p>';
    }

    var cards = list.map(function (item, i) {
      var project = item[0];
      var index = item[1];

      return '<a class="ring-card" href="#/work/' +
        pid(project, index) + '" data-ring-card ' +
        'aria-label="open project: ' + esc(project.title) + '">' +
        '<span class="ring-card-art">' +
        art(project, index, 0) +
        '</span>' +
        '<span class="ring-card-caption">' +
        '<span class="ring-card-number">' + pad(index + 1) + '</span>' +
        '<span class="ring-card-title">' + esc(project.title) + '</span>' +
        '<span class="ring-card-arrow" aria-hidden="true">↗</span>' +
        '</span></a>';
    }).join('');

    return '<section class="archive-ring-shell">' +
      '<div class="ring-topline">' +
      '<span>visual index / 2026</span>' +
      '<span>' + pad(list.length) + ' projects</span>' +
      '</div>' +
      '<div class="archive-ring" data-archive-ring tabindex="0" ' +
      'aria-label="project carousel. drag or use arrow keys to rotate.">' +
      '<div class="ring-stage" data-ring-stage>' +
      '<div class="ring-track" data-ring-track>' + cards + '</div>' +
      '</div>' +
      '<div class="ring-controls">' +
      '<button type="button" data-ring-prev aria-label="previous projects">←</button>' +
      '<span data-ring-counter>01 / ' + pad(list.length) + '</span>' +
      '<button type="button" data-ring-next aria-label="next projects">→</button>' +
      '</div></div>' +
      '<p class="ring-hint">drag to explore · scroll to rotate</p>' +
      '<div class="ring-bottomline">' +
      '<span>habibah / independent visual archive</span>' +
      '<span>' + pad(list.length) + ' works</span>' +
      '</div></section>';
  }

  function hero() {
    return '<section class="intro">' +
      '<div class="intro-name">' +
      '<h1 lang="ar" dir="rtl">حبيبه</h1>' +
      '<p class="intro-title">visual creative</p>' +
      '<span class="translation" lang="ar" dir="rtl">مُبْدِعَةٌ بَصَرِيَّةٌ</span>' +
      '</div>' +
      '<p class="intro-description">' +
      esc(S.intro || S.tagline || '') +
      '</p></section>';
  }

  function tr(english, arabic) {
    return '<span class="nav-label">' +
      '<span class="nav-en">' + english + '</span>' +
      '<span class="translation" lang="ar" dir="rtl">' +
      arabic + '</span></span>';
  }

  function archiveHeading() {
    return '<div class="archive-heading">' +
      '<div><h2>the archive</h2>' +
      '<span class="translation" lang="ar" dir="rtl">أَرْشِيفُ الْأَعْمَالِ</span>' +
      '</div><p>a collection of visual experiments and projects</p>' +
      '</div>';
  }

  var views = {
    home: function () {
      return hero() +
        '<section class="archive-section">' +
        archiveHeading() + lib(items()) +
        '<p class="archive-more"><a href="#/work">' +
        tr('view all work', 'عَرْضُ كُلِّ الْأَعْمَالِ') +
        '</a></p></section>';
    },

    work: function () {
      return '<section class="archive-section">' +
        archiveHeading() +
        '<div class="filters" role="group" aria-label="Filter by category">' +
        ['All'].concat(Array.isArray(S.categories) ? S.categories : [])
          .map(function (category) {
            return '<button type="button" aria-pressed="' +
              (category === 'All' ? 'true' : 'false') +
              '" data-c="' + esc(category) + '">' +
              esc(category) + '</button>';
          }).join('') +
        '</div><div id="g">' + lib(items()) +
        '</div></section>';
    },

    about: function () {
      return '<section class="about"><h1>about</h1>' +
        '<span class="translation" lang="ar" dir="rtl">مَنْ أَنَا</span>' +
        '<div class="txt">' + paras(S.about) + '</div></section>';
    },

    contact: function () {
      var links = [];

      if (S.email) {
        links.push('<a href="mailto:' + esc(S.email) + '">' +
          esc(S.email) + '</a>');
      }

      (Array.isArray(S.links) ? S.links : []).forEach(function (link) {
        if (!link.url || !link.label) return;
        links.push('<a href="' + esc(link.url) +
          '" target="_blank" rel="noopener">' +
          esc(link.label) + '</a>');
      });

      return '<section class="links"><div><h1>contact</h1>' +
        '<span class="translation" lang="ar" dir="rtl">تَوَاصُل</span>' +
        '</div>' + links.join('') + '</section>';
    }
  };

  function project(id) {
    var match = String(id).match(/^(\d+)-/);
    var index = match ? parseInt(match[1], 10) - 1 : -1;
    var item = P[index];

    if (!item) {
      return '<p class="txt">project not found. ' +
        '<a href="#/work">back to work</a></p>';
    }

    var count = Math.max((item.images || []).length, 4);
    var gallery = '';
    var captions = '';
    var description = String(item.description || '').split(/\n\s*\n/);

    for (var j = 0; j < count; j++) {
      gallery += '<figure class="sq" tabindex="0" role="button" ' +
        'aria-label="view image ' + (j + 1) + ' larger">' +
        '<span class="num">' + circ(j + 1) + '</span>' +
        '<div class="art">' + art(item, index, j) + '</div></figure>';

      if (cap(item, j)) {
        captions += '<li><span>' + circ(j + 1) + '</span>' +
          esc(cap(item, j)) + '</li>';
      }
    }

    return '<div class="pj"><div class="sqs">' + gallery +
      '</div><aside><a href="#/work">back to work</a>' +
      '<span class="translation" lang="ar" dir="rtl">الْعَوْدَةُ إِلَى الْأَعْمَالِ</span>' +
      '<h1>' + esc(item.title) + '</h1><hr>' +
      '<p class="it">' + esc(description[0]) + '</p>' +
      (captions ? '<ul class="cl">' + captions + '</ul>' : '') +
      '<h3>details</h3>' +
      '<span class="translation" lang="ar" dir="rtl">التَّفَاصِيل</span>' +
      '<p class="meta">' + esc(item.category) +
      (item.year ? ', ' + esc(item.year) : '') + '</p>' +
      paras(description.slice(1).join('\n\n')) +
      (item.role ? '<h3>my role</h3>' +
        '<span class="translation" lang="ar" dir="rtl">دَوْرِي</span>' +
        '<p>' + esc(item.role) + '</p>' : '') +
      (item.process ? '<h3>process</h3>' +
        '<span class="translation" lang="ar" dir="rtl">مَرَاحِلُ الْعَمَلِ</span>' +
        paras(item.process) : '') +
      '</aside></div>';
  }

  /* ======================================
     SMOOTH 3D RING INTERACTION
     ====================================== */

  function setupRing() {
    if (ringCleanup) {
      ringCleanup();
      ringCleanup = null;
    }

    var ring = document.querySelector('[data-archive-ring]');
    if (!ring) return;

    var stage = ring.querySelector('[data-ring-stage]');
    var track = ring.querySelector('[data-ring-track]');
    var cards = Array.prototype.slice.call(
      ring.querySelectorAll('[data-ring-card]')
    );
    var counter = ring.querySelector('[data-ring-counter]');

    if (!stage || !track || !cards.length) return;

    var angle = 0;
    var step = 360 / cards.length;
    var radius = 0;

    var dragging = false;
    var moved = false;
    var startX = 0;
    var startY = 0;
    var lastX = 0;
    var lastTime = 0;
    var dragStartAngle = 0;
    var velocity = 0;

    var raf = 0;
    var wheelTimer = 0;
    var resizeObserver = null;

    var friction = 0.94;
    var minVelocity = 0.015;
    var dragSensitivity = 0.42;

    function stopAnimation() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function render() {
      track.style.transform =
        'translateZ(0) rotateY(' + angle + 'deg)';

      var active = Math.round(-angle / step);
      active = ((active % cards.length) + cards.length) %
        cards.length;

      if (counter) {
        counter.textContent =
          pad(active + 1) + ' / ' + pad(cards.length);
      }

      cards.forEach(function (card, i) {
        var cardAngle = i * step + angle;
        var distance = Math.abs(
          ((cardAngle % 360) + 540) % 360 - 180
        );

        card.classList.toggle(
          'is-front',
          distance < step * 0.55
        );
      });
    }

    function measure() {
      var width = stage.clientWidth;

      if (window.innerWidth < 600) {
        radius = Math.max(115, Math.min(width * 0.54, 230));
      } else {
        radius = Math.max(150, Math.min(width * 0.48, 430));
      }

      cards.forEach(function (card, i) {
        card.style.transform =
          'translate(-50%, -50%) rotateY(' +
          (i * step) + 'deg) translateZ(' + radius + 'px)';
      });

      render();
    }

    function animate() {
      if (dragging) {
        raf = 0;
        return;
      }

      angle += velocity;
      velocity *= friction;

      render();

      if (Math.abs(velocity) > minVelocity) {
        raf = requestAnimationFrame(animate);
      } else {
        velocity = 0;
        raf = 0;
        render();
      }
    }

    function startInertia() {
      stopAnimation();

      if (Math.abs(velocity) <= minVelocity) {
        velocity = 0;
        render();
        return;
      }

      raf = requestAnimationFrame(animate);
    }

    function rotate(direction) {
      stopAnimation();
      velocity = 0;
      angle -= direction * step;
      render();
    }

    function pointerDown(event) {
      if (event.target.closest('button')) return;

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      stopAnimation();

      dragging = true;
      moved = false;
      velocity = 0;

      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      dragStartAngle = angle;

      ring.classList.add('is-dragging');

      if (ring.setPointerCapture && event.pointerId != null) {
        try {
          ring.setPointerCapture(event.pointerId);
        } catch (e) {}
      }
    }

    function pointerMove(event) {
      if (!dragging) return;

      var dx = event.clientX - startX;
      var dy = event.clientY - startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        moved = true;
      }

      var now = event.timeStamp;
      var deltaX = event.clientX - lastX;
      var deltaTime = Math.max(1, now - lastTime);

      var instantVelocity =
        deltaX * dragSensitivity / deltaTime * 16.67;

      velocity = velocity * 0.35 + instantVelocity * 0.65;

      angle = dragStartAngle + dx * dragSensitivity;

      lastX = event.clientX;
      lastTime = now;

      render();
    }

    function pointerUp() {
      if (!dragging) return;

      dragging = false;
      ring.classList.remove('is-dragging');

      if (moved) {
        ring.dataset.justDragged = 'true';

        window.setTimeout(function () {
          delete ring.dataset.justDragged;
        }, 250);
      }

      startInertia();
    }

    function wheel(event) {
      if (Math.abs(event.deltaY) < 2 &&
          Math.abs(event.deltaX) < 2) {
        return;
      }

      stopAnimation();

      var delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

      velocity += -delta * 0.025;
      velocity = Math.max(-8, Math.min(8, velocity));

      window.clearTimeout(wheelTimer);

      wheelTimer = window.setTimeout(function () {
        startInertia();
      }, 90);
    }

    function keydown(event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        rotate(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        rotate(-1);
      }
    }

    function clickCard(event) {
      if (ring.dataset.justDragged === 'true') {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    var prev = ring.querySelector('[data-ring-prev]');
    var next = ring.querySelector('[data-ring-next]');

    function onPrev() {
      rotate(-1);
    }

    function onNext() {
      rotate(1);
    }

    ring.addEventListener('pointerdown', pointerDown);
    ring.addEventListener('pointermove', pointerMove);
    ring.addEventListener('pointerup', pointerUp);
    ring.addEventListener('pointercancel', pointerUp);
    ring.addEventListener('wheel', wheel, { passive: true });
    ring.addEventListener('keydown', keydown);
    ring.addEventListener('click', clickCard, true);

    if (prev) prev.addEventListener('click', onPrev);
    if (next) next.addEventListener('click', onNext);

    resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null;

    if (resizeObserver) {
      resizeObserver.observe(stage);
    } else {
      window.addEventListener('resize', measure);
    }

    measure();

    ringCleanup = function () {
      stopAnimation();

      ring.removeEventListener('pointerdown', pointerDown);
      ring.removeEventListener('pointermove', pointerMove);
      ring.removeEventListener('pointerup', pointerUp);
      ring.removeEventListener('pointercancel', pointerUp);
      ring.removeEventListener('wheel', wheel);
      ring.removeEventListener('keydown', keydown);
      ring.removeEventListener('click', clickCard, true);

      if (prev) prev.removeEventListener('click', onPrev);
      if (next) next.removeEventListener('click', onNext);

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', measure);
      }

      window.clearTimeout(wheelTimer);
    };
  }

  function route() {
    if (!app || !started) return;

    var hash = location.hash.replace(/^#\/?/, '').split('/');
    var page = hash[0] || 'home';

    if (['home', 'work', 'about', 'contact'].indexOf(page) < 0) {
      page = 'home';
    }

    try {
      if (page === 'work' && hash[1]) {
        app.innerHTML = project(hash[1]);
      } else {
        app.innerHTML = views[page]();
      }
    } catch (error) {
      console.error('Page rendering error:', error);
      app.innerHTML = '<p class="txt">this page could not be displayed. ' +
        '<a href="#/">return home</a></p>';
    }

    if (page === 'home' || page === 'work') {
      setupRing();
    } else if (ringCleanup) {
      ringCleanup();
      ringCleanup = null;
    }

    document.title = (page === 'home' ? '' : page + ' | ') + 'habibah';

    [].forEach.call(document.querySelectorAll('header nav a'), function (link) {
      var href = link.getAttribute('href');

      if (href === '#/' + page) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function openImage(element) {
    if (!lb || !lbc) return;

    var artwork = element.querySelector('.art');
    if (!artwork) return;

    lbc.innerHTML = artwork.innerHTML;

    if (typeof lb.showModal === 'function') {
      lb.showModal();
    }
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var filter = target.closest && target.closest('button[data-c]');
    var image = target.closest && target.closest('.sq');

    if (filter) {
      [].forEach.call(filter.parentNode.children, function (button) {
        button.setAttribute(
          'aria-pressed',
          button === filter ? 'true' : 'false'
        );
      });

      var grid = document.getElementById('g');

      if (grid) {
        grid.innerHTML = lib(items(filter.dataset.c));
        setupRing();
      }
    } else if (image) {
      openImage(image);
    } else if (target.id === 'lbx' || target === lb) {
      if (lb && lb.open) lb.close();
    }
  });

  document.addEventListener('keydown', function (event) {
    var image = event.target.closest && event.target.closest('.sq');

    if (image && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openImage(image);
    }
  });

  function showError(message) {
    if (!app) return;

    app.innerHTML =
      '<section class="about">' +
      '<h1>something went wrong</h1>' +
      '<p class="txt">' + esc(message) + '</p>' +
      '<p class="txt">please refresh the page or try again later.</p>' +
      '<button type="button" id="retry-load">try again</button>' +
      '</section>';

    var retry = document.getElementById('retry-load');
    if (retry) retry.addEventListener('click', start);
  }

  function loadJSON(url) {
    var controller = typeof AbortController !== 'undefined'
      ? new AbortController()
      : null;

    var timer = controller ? setTimeout(function () {
      controller.abort();
    }, 12000) : null;

    var options = { cache: 'no-cache' };
    if (controller) options.signal = controller.signal;

    return fetch(url, options)
      .then(function (response) {
        if (!response.ok) {
          throw new Error(url + ' returned HTTP ' + response.status);
        }

        return response.json();
      })
      .catch(function (error) {
        if (error.name === 'AbortError') {
          throw new Error('Loading timed out: ' + url);
        }

        throw error;
      })
      .finally(function () {
        if (timer) clearTimeout(timer);
      });
  }

  function start() {
    if (!app) {
      console.error('Required element #app was not found in index.html.');
      return;
    }

    app.innerHTML = '<p class="txt">loading portfolio...</p>';

    Promise.all([
      loadJSON('data/site.json'),
      loadJSON('data/projects.json')
    ]).then(function (results) {
      if (!results[0] || typeof results[0] !== 'object') {
        throw new Error('site.json does not contain valid site settings.');
      }

      if (!results[1] || !Array.isArray(results[1].projects)) {
        throw new Error('projects.json must contain a projects array.');
      }

      S = results[0];
      P = results[1].projects;
      started = true;

      if (foot) {
        foot.innerHTML =
          '<div class="bar">' +
          '<div class="big">habibah</div>' +
          '<a href="#/">' + tr('home', 'الرَّئِيسِيَّة') + '</a>' +
          '<a href="#/work">' + tr('work', 'الْأَعْمَال') + '</a>' +
          '<a href="#/about">' + tr('about', 'مَنْ أَنَا') + '</a>' +
          '<a href="#/contact">' + tr('contact', 'تَوَاصُل') + '</a>' +
          '</div>';
      }

      window.removeEventListener('hashchange', route);
      window.addEventListener('hashchange', route);
      route();
    }).catch(function (error) {
      started = false;
      console.error('Portfolio loading failed:', error);

      showError(
        'Portfolio data could not load. Check the data/site.json and ' +
        'data/projects.json files. Details: ' + error.message
      );
    });
  }

  start();
})();
