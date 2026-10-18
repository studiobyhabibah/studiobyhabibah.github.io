
(function () {
  'use strict';

  var app = document.getElementById('app');
  var foot = document.getElementById('foot');
  var lb = document.getElementById('lb');
  var lbc = document.getElementById('lbc');

  if (!app || !foot || !lb || !lbc) {
    console.error('Portfolio: required HTML elements are missing.');
    return;
  }

  var S = {};
  var P = [];
  var currentFilter = 'all';
  var ringFrame = 0;
  var ringCleanup = null;

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
    return String(value || 'project')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'project';
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function codeNumber(value) {
    return 'work_' + pad(value);
  }

  function pid(project, index) {
    return slug(project.id || project.title || project.name) + '-' + index;
  }

  function plain(value) {
    if (Array.isArray(value)) {
      return value.map(plain).filter(Boolean).join('\n\n');
    }

    if (value && typeof value === 'object') {
      return value.text || value.description || value.title || '';
    }

    return value == null ? '' : String(value);
  }

  function paragraphs(value) {
    var text = plain(value).trim();

    return text
      ? text.split(/\n{2,}/)
          .map(function (p) {
            return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>';
          })
          .join('')
      : '';
  }

  function projectImages(project) {
    var images = project.images || project.gallery || project.artworks || [];

    if (!Array.isArray(images)) images = [];

    if (!images.length && (project.image || project.cover)) {
      images = [project.image || project.cover];
    }

    return images;
  }

  function src(project, index) {
    var entry = projectImages(project)[index];

    if (entry && typeof entry === 'object') {
      return entry.image || entry.src || entry.url || entry.path || '';
    }

    return entry || '';
  }

  function imageCaption(project, index) {
    var entry = projectImages(project)[index];

    return entry && typeof entry === 'object'
      ? (entry.caption || entry.alt || project.title || 'artwork')
      : (project.title || 'artwork');
  }

  function placeholder(label) {
    return '<svg viewBox="0 0 600 750" role="img" aria-label="' +
      esc(label || 'artwork preview') +
      '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">' +
      '<stop stop-color="#fffefa"/><stop offset="1" stop-color="#f4e6a5"/>' +
      '</linearGradient></defs>' +
      '<rect width="600" height="750" fill="url(#paper)"/>' +
      '<circle cx="420" cy="180" r="115" fill="#fff" fill-opacity=".6"/>' +
      '<path d="M0 570 Q160 490 300 580 T600 540 V750 H0Z" fill="#65472f" fill-opacity=".10"/>' +
      '<text x="300" y="365" text-anchor="middle" fill="#65472f" font-family="Georgia,serif" font-size="24">' +
      esc(label || 'visual archive') +
      '</text></svg>';
  }

  function art(project, index) {
    var image = src(project, index || 0);

    return image
      ? '<img src="' + esc(image) + '" alt="' +
          esc(imageCaption(project, index || 0)) +
          '" loading="lazy">'
      : placeholder(project.title || project.name);
  }

  function items(category) {
    return P.map(function (project, index) {
      return [project, index];
    }).filter(function (item) {
      return !category ||
        category === 'all' ||
        String(item[0].category || 'other').toLowerCase() ===
        String(category).toLowerCase();
    });
  }

  function archiveHeading() {
    return '<div class="archive-heading"><div>' +
      '<h2>the archive</h2>' +
      '<span class="translation" lang="ar" dir="rtl">أَرْشِيفُ الْأَعْمَالِ</span>' +
      '</div><p>a collection of visual experiments and projects</p></div>';
  }

  function lib(list) {
    if (!list.length) {
      return '<p class="txt empty-state">no projects in this category yet.</p>';
    }

    var cards = list.map(function (item) {
      var p = item[0];
      var i = item[1];

      return '<a class="ring-card" href="#/work/' +
        esc(pid(p, i)) +
        '" aria-label="open ' +
        esc(p.title || p.name || 'project') +
        '">' +
        '<span class="ring-card-art">' + art(p, 0) + '</span>' +
        '<span class="ring-card-caption">' +
        '<span class="ring-card-number">' + esc(codeNumber(i + 1)) + '</span>' +
        '<span class="ring-card-title">' + esc(p.title || p.name || 'untitled project') + '</span>' +
        '<span class="ring-card-category">' + esc(p.category || 'project') + '</span>' +
        '</span><span class="ring-card-shine" aria-hidden="true"></span></a>';
    }).join('');

    return '<section class="ring-archive" aria-label="project archive">' +
      '<div class="archive-file-header">' +
      '<div class="archive-file-heading">' +
      '<span class="archive-file-kicker">visual index / 2026</span>' +
      '<span class="archive-file-title-main">habibah / archive</span>' +
      '<span class="archive-file-ar" lang="ar" dir="rtl">أَرْشِيفُ الْأَعْمَالِ</span>' +
      '</div><div class="archive-file-total">' +
      '<span>' + pad(list.length) + '</span><span>projects</span>' +
      '</div></div>' +
      '<div class="ring-scene" aria-label="drag or scroll to rotate the 3D project archive">' +
      '<div class="ring-stage"><div class="archive-ring">' + cards + '</div></div>' +
      '</div></section>';
  }

  function hero() {
    return '<section class="intro"><div class="intro-name">' +
      '<h1>' + esc(S.name || 'حبيبه') + '</h1>' +
      '<p class="intro-title">' + esc(S.title || 'visual creative') + '</p>' +
      '<span class="translation" lang="ar" dir="rtl">مُبْدِعَةٌ بَصَرِيَّة</span>' +
      '</div><p class="intro-description">' +
      esc(plain(S.intro || S.description ||
        'exploring design, characters, stories, and visual culture.')) +
      '</p></section>';
  }

  function categories() {
    var seen = {};

    P.forEach(function (p) {
      var c = String(p.category || 'other').trim();
      if (c) seen[c.toLowerCase()] = c;
    });

    return Object.keys(seen).sort().map(function (key) {
      return seen[key];
    });
  }

  function views() {
    return {
      home: function () {
        return hero() +
          '<section class="archive-section">' +
          archiveHeading() +
          '<div class="archive-content">' + lib(items('all')) + '</div>' +
          '</section>';
      },

      work: function () {
        var buttons =
          '<button type="button" data-filter="all" aria-pressed="' +
          (currentFilter === 'all' ? 'true' : 'false') +
          '">all work</button>';

        buttons += categories().map(function (c) {
          return '<button type="button" data-filter="' + esc(c) +
            '" aria-pressed="' +
            (currentFilter.toLowerCase() === c.toLowerCase() ? 'true' : 'false') +
            '">' + esc(c) + '</button>';
        }).join('');

        return '<section class="archive-section work-page">' +
          archiveHeading() +
          '<div class="filters" aria-label="filter projects">' + buttons + '</div>' +
          '<div id="project-ring-results">' + lib(items(currentFilter)) + '</div>' +
          '</section>';
      },

      about: function () {
        return '<section class="about"><h1>about</h1>' +
          '<span class="translation" lang="ar" dir="rtl">مَنْ أَنَا</span>' +
          '<div class="txt">' +
          paragraphs(S.about || S.bio || S.aboutText ||
            'i am a visual creative exploring design, characters, stories, and visual culture.') +
          '</div></section>';
      },

      contact: function () {
        var c = S.contact || {};
        var links = Array.isArray(c) ? c : (c.links || S.links || []);

        var html = '<section class="links"><div><h1>contact</h1>' +
          '<span class="translation" lang="ar" dir="rtl">تَوَاصُل</span></div>';

        if (typeof c === 'string') html += paragraphs(c);

        if (Array.isArray(links)) {
          html += links.map(function (link) {
            if (typeof link === 'string') {
              return '<a href="' + esc(link) +
                '" target="_blank" rel="noreferrer">' +
                esc(link.replace(/^https?:\/\//, '')) + ' ↗</a>';
            }

            var label = link.label || link.name || link.title ||
              link.url || link.href || 'link';
            var href = link.url || link.href ||
              (link.email ? 'mailto:' + link.email : '#');

            return '<a href="' + esc(href) + '"' +
              (/^https?:/.test(href) ? ' target="_blank" rel="noreferrer"' : '') +
              '>' + esc(label) + ' ↗</a>';
          }).join('');
        }

        if (!links.length && typeof c !== 'string') {
          html += '<a href="mailto:ihabibahhamdi@gmail.com">email ↗</a>';
        }

        return html + '</section>';
      }
    };
  }

  function findProject(id) {
    for (var i = 0; i < P.length; i++) {
      if (
        pid(P[i], i) === id ||
        String(P[i].id || '') === id ||
        slug(P[i].title || P[i].name) === id ||
        String(i) === id
      ) {
        return [P[i], i];
      }
    }

    return null;
  }

  function project(id) {
    var found = findProject(id);

    if (!found) {
      return '<section class="about"><h1>project not found</h1>' +
        '<a href="#/work">← back to work</a></section>';
    }

    var p = found[0];
    var i = found[1];
    var images = projectImages(p);
    var title = p.title || p.name || 'untitled project';

    var gallery = images.map(function (image, n) {
      return '<button class="sq" type="button" data-lightbox-index="' + n +
        '" aria-label="view image ' + (n + 1) + '">' +
        '<span class="num">' + pad(n + 1) + '</span>' +
        '<span class="art">' + art(p, n) + '</span></button>';
    }).join('');

    var aside = '<aside><a href="#/work">← back to archive</a>' +
      '<span class="translation" lang="ar" dir="rtl">أَرْشِيفُ الْأَعْمَالِ</span>' +
      '<p class="project-code">' + esc(codeNumber(i + 1)) +
      ' / ' + esc(p.category || 'project') + '</p>' +
      '<h1>' + esc(title) + '</h1>' +
      '<div class="it">' +
      paragraphs(p.description || p.about || p.text || p.summary || '') +
      '</div>';

    var meta = [];

    ['year', 'client', 'role', 'tools', 'medium'].forEach(function (key) {
      if (p[key]) {
        meta.push('<li><span>' + esc(key) + '</span><span>' +
          esc(Array.isArray(p[key]) ? p[key].join(', ') : p[key]) +
          '</span></li>');
      }
    });

    if (meta.length) {
      aside += '<h3>project notes</h3><ul class="cl">' +
        meta.join('') + '</ul>';
    }

    aside += '</aside>';

    return '<section class="pj"><div class="sqs">' +
      (gallery || '<div class="sq"><span class="art">' + art(p, 0) + '</span></div>') +
      '</div>' + aside + '</section>';
  }

  function renderFooter() {
    foot.innerHTML = '<div class="bar">' +
      '<a class="big" href="#/">حبيبه</a>' +
      '<a class="nav-label" href="#/work">work<span class="translation" lang="ar" dir="rtl">الأَعْمَال</span></a>' +
      '<a class="nav-label" href="#/about">about<span class="translation" lang="ar" dir="rtl">مَنْ أَنَا</span></a>' +
      '<a class="nav-label" href="#/contact">contact<span class="translation" lang="ar" dir="rtl">تَوَاصُل</span></a>' +
      '</div>';
  }

  function setupArchiveRing() {
    if (ringCleanup) {
      ringCleanup();
      ringCleanup = null;
    }

    if (ringFrame) {
      cancelAnimationFrame(ringFrame);
      ringFrame = 0;
    }

    var scene = document.querySelector('.ring-scene');
    var ring = scene && scene.querySelector('.archive-ring');

    if (!scene || !ring) return;

    var cards = Array.prototype.slice.call(ring.children);
    var count = cards.length;

    if (!count) return;

    var rotation = 0;
    var target = 0;
    var velocity = 0;
    var lastMouseX = null;
    var dragging = false;
    var moved = false;
    var startX = 0;
    var lastX = 0;
    var pointerId = null;
    var suppressClick = false;
    var suppressTimer = null;
    var destroyed = false;

    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render() {
      ring.style.transform = 'rotateX(-7deg) rotateY(' + rotation + 'deg)';

      cards.forEach(function (card, index) {
        var angle = (index * 360 / count + rotation) * Math.PI / 180;
        card.style.zIndex = String(Math.round((Math.cos(angle) + 1) * 1000));
        card.style.pointerEvents = 'auto';
      });
    }

    function arrange() {
      var mobile = window.innerWidth <= 560;
      var width = mobile ? 132 : 190;

      var radius = count === 1
        ? 0
        : count === 2
          ? width * 0.9
          : Math.max(
              mobile ? 210 : 255,
              Math.min(520, width / (2 * Math.tan(Math.PI / count)))
            );

      cards.forEach(function (card, index) {
        card.style.transform =
          'translate(-50%, -50%) rotateY(' +
          (index * 360 / count) +
          'deg) translateZ(' + radius + 'px)';
      });

      render();
    }

    function tick() {
      ringFrame = 0;
      if (destroyed) return;

      if (reduced) {
        rotation = target;
        velocity = 0;
        render();
        return;
      }

      var difference = target - rotation;
      velocity += difference * 0.075;
      velocity *= 0.78;
      rotation += velocity;

      if (
        Math.abs(difference) < 0.025 &&
        Math.abs(velocity) < 0.025
      ) {
        rotation = target;
        velocity = 0;
        render();
        return;
      }

      render();
      ringFrame = requestAnimationFrame(tick);
    }

    function animate() {
      if (destroyed) return;

      if (reduced) {
        rotation = target;
        velocity = 0;
        render();
      } else if (!ringFrame) {
        ringFrame = requestAnimationFrame(tick);
      }
    }

    function onMouseMove(event) {
      if (
        event.pointerType === 'touch' ||
        dragging ||
        window.innerWidth <= 560
      ) return;

      if (lastMouseX === null) {
        lastMouseX = event.clientX;
        return;
      }

      var delta = event.clientX - lastMouseX;
      lastMouseX = event.clientX;

      if (Math.abs(delta) > 90 || delta === 0) return;

      target += delta * 0.42;
      animate();
    }

    function onMouseLeave() {
      lastMouseX = null;
    }

    function onPointerDown(event) {
      if (event.pointerType === 'mouse') return;
      if (event.button !== undefined && event.button !== 0) return;

      dragging = true;
      moved = false;
      startX = lastX = event.clientX;
      pointerId = event.pointerId;

      scene.classList.add('is-dragging');

      if (scene.setPointerCapture) {
        try {
          scene.setPointerCapture(pointerId);
        } catch (error) {}
      }
    }

    function onTouchMove(event) {
      if (
        event.pointerType === 'mouse' ||
        !dragging ||
        event.pointerId !== pointerId
      ) return;

      var delta = event.clientX - lastX;

      if (Math.abs(event.clientX - startX) > 6) {
        moved = true;
      }

      if (moved) {
        target += delta * 0.5;
        animate();
      }

      lastX = event.clientX;
    }

    function onPointerUp(event) {
      if (
        !dragging ||
        (event.pointerId != null && event.pointerId !== pointerId)
      ) return;

      dragging = false;
      scene.classList.remove('is-dragging');

      if (moved) {
        suppressClick = true;

        if (suppressTimer) window.clearTimeout(suppressTimer);

        suppressTimer = window.setTimeout(function () {
          suppressClick = false;
          suppressTimer = null;
        }, 250);
      }

      pointerId = null;
      lastMouseX = null;
    }

    function onClick(event) {
      var card = event.target.closest &&
        event.target.closest('a.ring-card');

      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;

        if (suppressTimer) {
          window.clearTimeout(suppressTimer);
          suppressTimer = null;
        }

        return;
      }

      if (card && card.getAttribute('href')) {
        event.preventDefault();
        window.location.hash = card.getAttribute('href').replace(/^#/, '');
      }
    }

    function onResize() {
      lastMouseX = null;
      arrange();
    }

    scene.addEventListener('pointermove', onMouseMove);
    scene.addEventListener('pointerleave', onMouseLeave);
    scene.addEventListener('pointerdown', onPointerDown);
    scene.addEventListener('pointermove', onTouchMove);
    scene.addEventListener('pointerup', onPointerUp);
    scene.addEventListener('pointercancel', onPointerUp);
    scene.addEventListener('click', onClick, true);
    window.addEventListener('resize', onResize, { passive: true });

    arrange();

    ringCleanup = function () {
      destroyed = true;

      scene.removeEventListener('pointermove', onMouseMove);
      scene.removeEventListener('pointerleave', onMouseLeave);
      scene.removeEventListener('pointerdown', onPointerDown);
      scene.removeEventListener('pointermove', onTouchMove);
      scene.removeEventListener('pointerup', onPointerUp);
      scene.removeEventListener('pointercancel', onPointerUp);
      scene.removeEventListener('click', onClick, true);
      window.removeEventListener('resize', onResize);

      if (suppressTimer) window.clearTimeout(suppressTimer);
      if (ringFrame) cancelAnimationFrame(ringFrame);

      ringFrame = 0;
    };
  }

  function route() {
    var parts = window.location.hash
      .replace(/^#\/?/, '')
      .split('/')
      .filter(Boolean);

    var page = parts[0] || 'home';
    var id = parts[1];
    var title = 'حبيبه — visual creative';

    if (page === 'work' && id) {
      app.innerHTML = project(id);

      var found = findProject(id);

      if (found) {
        title = (found[0].title || found[0].name || 'project') + ' — حبيبه';
      }

      if (ringCleanup) {
        ringCleanup();
        ringCleanup = null;
      }
    } else {
      var allViews = views();

      if (!allViews[page]) page = 'home';

      app.innerHTML = allViews[page]();

      if (page === 'about') title = 'about — حبيبه';
      if (page === 'contact') title = 'contact — حبيبه';

      setupArchiveRing();
    }

    document.title = title;

    document.querySelectorAll('.main-nav a').forEach(function (link) {
      var target = link.getAttribute('href')
        .replace(/^#\/?/, '')
        .split('/')[0];

      if (target === page) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    window.scrollTo(0, 0);
  }

  document.addEventListener('click', function (event) {
    var filter = event.target.closest('[data-filter]');

    if (filter) {
      currentFilter = filter.getAttribute('data-filter') || 'all';

      document.querySelectorAll('[data-filter]').forEach(function (button) {
        button.setAttribute(
          'aria-pressed',
          button.getAttribute('data-filter').toLowerCase() ===
          currentFilter.toLowerCase() ? 'true' : 'false'
        );
      });

      var results = document.getElementById('project-ring-results');

      if (results) {
        results.innerHTML = lib(items(currentFilter));
        setupArchiveRing();
      }

      return;
    }

    var imageButton = event.target.closest('[data-lightbox-index]');

    if (imageButton) {
      var id = window.location.hash
        .replace(/^#\/?/, '')
        .split('/')[1];

      var found = findProject(id);

      if (found) {
        openImage(found[0], Number(imageButton.getAttribute('data-lightbox-index')));
      }
    }
  });

  function openImage(projectData, index) {
    lbc.innerHTML = art(projectData, index);

    var image = lbc.querySelector('img');

    if (image) image.removeAttribute('loading');

    if (typeof lb.showModal === 'function') {
      lb.showModal();
    } else {
      lb.setAttribute('open', '');
    }
  }

  function closeImage() {
    if (lb.open && typeof lb.close === 'function') {
      lb.close();
    } else {
      lb.removeAttribute('open');
    }
  }

  var lightboxClose = document.getElementById('lbx');

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeImage);
  }

  lb.addEventListener('click', function (event) {
    if (event.target === lb) closeImage();
  });

  function loadJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) {
        throw new Error('Could not load ' + url);
      }

      return response.json();
    });
  }

  Promise.all([
    loadJSON('data/site.json').catch(function () {
      return {};
    }),
    loadJSON('data/projects.json').catch(function () {
      return [];
    })
  ]).then(function (data) {
    S = data[0] && typeof data[0] === 'object' ? data[0] : {};

    var projects = data[1];

    P = Array.isArray(projects)
      ? projects
      : (projects && Array.isArray(projects.projects) ? projects.projects : []);

    renderFooter();
    route();
  }).catch(function (error) {
    console.error('Portfolio loading error:', error);

    app.innerHTML =
      '<section class="about"><h1>something went wrong</h1>' +
      '<p>please check data/site.json and data/projects.json.</p></section>';

    renderFooter();
  });

  window.addEventListener('hashchange', route);
})();
