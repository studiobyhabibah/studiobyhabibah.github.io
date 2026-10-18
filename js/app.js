
(function () {
  'use strict';

  const app = document.getElementById('app');
  const footer = document.getElementById('foot');
  const lightbox = document.getElementById('lb');
  const lightboxContent = document.getElementById('lbc');
  const closeButton = document.getElementById('lbx');

  if (!app || !footer || !lightbox || !lightboxContent) {
    console.error('Portfolio: required HTML elements are missing.');
    return;
  }

  let site = {};
  let projects = [];
  let currentFilter = 'all';
  let cleanupRing = null;
  let animationFrame = 0;

  /* ----------------------------------------
     HELPERS
  ---------------------------------------- */

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
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

  function projectId(project, index) {
    return slug(project.id || project.title || project.name) + '-' + index;
  }

  function projectTitle(project) {
    return project.title || project.name || 'untitled project';
  }

  function numberLabel(number) {
    return 'work_' + String(number).padStart(2, '0');
  }

  function asText(value) {
    if (Array.isArray(value)) {
      return value.map(asText).filter(Boolean).join('\n\n');
    }

    if (value && typeof value === 'object') {
      return value.text || value.description || value.title || '';
    }

    return value == null ? '' : String(value);
  }

  function paragraphs(value) {
    const text = asText(value).trim();

    if (!text) return '';

    return text.split(/\n{2,}/).map(function (paragraph) {
      return '<p>' + escapeHTML(paragraph).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function getImages(project) {
    let images = project.images || project.gallery || project.artworks || [];

    if (!Array.isArray(images)) images = [];

    if (!images.length && (project.image || project.cover)) {
      images = [project.image || project.cover];
    }

    return images;
  }

  function imageSource(project, index) {
    const image = getImages(project)[index];

    if (image && typeof image === 'object') {
      return image.image || image.src || image.url || image.path || '';
    }

    return image || '';
  }

  function imageAlt(project, index) {
    const image = getImages(project)[index];

    if (image && typeof image === 'object') {
      return image.alt || image.caption || projectTitle(project);
    }

    return projectTitle(project);
  }

  function artwork(project, index) {
    const source = imageSource(project, index);

    if (source) {
      return '<img src="' + escapeHTML(source) +
        '" alt="' + escapeHTML(imageAlt(project, index)) +
        '" loading="lazy" draggable="false">';
    }

    return '<div class="art-placeholder" aria-label="' +
      escapeHTML(projectTitle(project)) +
      '"><span>' + escapeHTML(projectTitle(project)) + '</span></div>';
  }

  function filteredProjects(category) {
    return projects.map(function (project, index) {
      return { project: project, index: index };
    }).filter(function (item) {
      return category === 'all' ||
        String(item.project.category || 'other').toLowerCase() ===
        String(category).toLowerCase();
    });
  }

  /* ----------------------------------------
     HEADER AND FOOTER
  ---------------------------------------- */

  function renderFooter() {
    footer.innerHTML =
      '<div class="bar">' +
        '<a class="big" href="#/">Habibah</a>' +
        '<a class="nav-label" href="#/work">work' +
          '<span class="translation" lang="ar" dir="rtl">الأَعْمَال</span>' +
        '</a>' +
        '<a class="nav-label" href="#/about">about' +
          '<span class="translation" lang="ar" dir="rtl">مَنْ أَنَا</span>' +
        '</a>' +
        '<a class="nav-label" href="#/contact">contact' +
          '<span class="translation" lang="ar" dir="rtl">تَوَاصُل</span>' +
        '</a>' +
      '</div>';
  }

  function hero() {
    const title = site.title || site.tagline || 'visual creative';
    const intro = site.intro || site.description ||
      'Exploring design, characters, stories, and visual culture.';

    return '<section class="intro">' +
      '<div class="intro-name">' +
        '<h1 lang="ar" dir="rtl">حبيبه</h1>' +
        '<p class="intro-title">' + escapeHTML(title) + '</p>' +
        '<span class="translation" lang="ar" dir="rtl">مُبْدِعَةٌ بَصَرِيَّة</span>' +
      '</div>' +
      '<p class="intro-description">' + escapeHTML(asText(intro)) + '</p>' +
    '</section>';
  }

  /* ----------------------------------------
     PROJECT CARDS AND 3D ARCHIVE
  ---------------------------------------- */

  function renderCards(list) {
    if (!list.length) {
      return '<p class="txt empty-state">no projects in this category yet.</p>';
    }

    const cards = list.map(function (item) {
      const project = item.project;
      const index = item.index;

      return '<a class="ring-card" href="#/work/' +
        escapeHTML(projectId(project, index)) +
        '" aria-label="open ' + escapeHTML(projectTitle(project)) + '">' +

        '<span class="ring-card-art">' +
          artwork(project, 0) +
        '</span>' +

        '<span class="ring-card-caption">' +
          '<span class="ring-card-number">' +
            escapeHTML(numberLabel(index + 1)) +
          '</span>' +
          '<span class="ring-card-title">' +
            escapeHTML(projectTitle(project)) +
          '</span>' +
          '<span class="ring-card-category">' +
            escapeHTML(project.category || 'project') +
          '</span>' +
        '</span>' +

        '<span class="ring-card-shine" aria-hidden="true"></span>' +
      '</a>';
    }).join('');

    /* No heading above the ring */

    return '<section class="ring-archive" aria-label="project archive">' +
      '<div class="ring-scene" aria-label="interactive 3D project gallery">' +
        '<div class="ring-stage">' +
          '<div class="archive-ring">' + cards + '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function renderFilters() {
    const categories = [];

    projects.forEach(function (project) {
      const category = String(project.category || 'other').trim();

      if (category && !categories.some(function (existing) {
        return existing.toLowerCase() === category.toLowerCase();
      })) {
        categories.push(category);
      }
    });

    const allCategories = ['all'].concat(categories);

    return '<div class="filters" aria-label="filter projects">' +
      allCategories.map(function (category) {
        const selected = category.toLowerCase() === currentFilter.toLowerCase();

        return '<button type="button" data-filter="' +
          escapeHTML(category) +
          '" aria-pressed="' + (selected ? 'true' : 'false') + '">' +
          escapeHTML(category === 'all' ? 'all work' : category) +
        '</button>';
      }).join('') +
    '</div>';
  }

  /* ----------------------------------------
     ABOUT AND CONTACT
  ---------------------------------------- */

  function renderAbout() {
    return '<section class="about">' +
      '<h1>about</h1>' +
      '<span class="translation" lang="ar" dir="rtl">مَنْ أَنَا</span>' +
      '<div class="txt">' +
        paragraphs(site.about || site.bio ||
          'I am a visual creative exploring design, characters, stories, and visual culture.') +
      '</div>' +
    '</section>';
  }

  function renderContact() {
    let links = site.contact || site.links || [];

    if (typeof links === 'object' && !Array.isArray(links)) {
      links = links.links || [];
    }

    let html = '<section class="links">' +
      '<div><h1>contact</h1>' +
      '<span class="translation" lang="ar" dir="rtl">تَوَاصُل</span></div>';

    if (typeof site.contact === 'string') {
      html += paragraphs(site.contact);
    }

    if (Array.isArray(links)) {
      html += links.map(function (link) {
        if (typeof link === 'string') {
          const safeLink = escapeHTML(link);
          return '<a href="' + safeLink +
            '" target="_blank" rel="noopener noreferrer">' +
            safeLink.replace(/^https?:\/\//, '') + ' ↗</a>';
        }

        const label = link.label || link.name || link.title || link.url || 'link';
        const href = link.url || link.href ||
          (link.email ? 'mailto:' + link.email : '');

        if (!href) return '';

        return '<a href="' + escapeHTML(href) + '"' +
          (/^https?:\/\//i.test(href)
            ? ' target="_blank" rel="noopener noreferrer"'
            : '') +
          '>' + escapeHTML(label) + ' ↗</a>';
      }).join('');
    }

    if (!links.length && !site.contact) {
      html += '<a href="mailto:' +
        escapeHTML(site.email || 'ihabibahhamdi@gmail.com') +
        '">email ↗</a>';
    }

    return html + '</section>';
  }

  /* ----------------------------------------
     PROJECT DETAIL PAGE
  ---------------------------------------- */

  function findProject(id) {
    for (let index = 0; index < projects.length; index++) {
      const project = projects[index];

      if (
        projectId(project, index) === id ||
        String(project.id || '') === id ||
        slug(project.title || project.name) === id ||
        String(index) === id
      ) {
        return { project: project, index: index };
      }
    }

    return null;
  }

  function renderProject(id) {
    const found = findProject(id);

    if (!found) {
      return '<section class="about">' +
        '<h1>project not found</h1>' +
        '<a href="#/work">← back to archive</a>' +
      '</section>';
    }

    const project = found.project;
    const index = found.index;
    const images = getImages(project);

    const gallery = images.map(function (image, imageIndex) {
      return '<button class="sq" type="button" ' +
        'data-lightbox-index="' + imageIndex + '" ' +
        'aria-label="view image ' + (imageIndex + 1) + '">' +
        '<span class="num">' +
          String(imageIndex + 1).padStart(2, '0') +
        '</span>' +
        '<span class="art">' +
          artwork(project, imageIndex) +
        '</span>' +
      '</button>';
    }).join('');

    let notes = '';

    ['year', 'client', 'role', 'tools', 'medium'].forEach(function (key) {
      if (project[key]) {
        const value = Array.isArray(project[key])
          ? project[key].join(', ')
          : project[key];

        notes += '<li><span>' + escapeHTML(key) + '</span>' +
          '<span>' + escapeHTML(value) + '</span></li>';
      }
    });

    let sidebar = '<aside>' +
      '<a href="#/work">← back to archive</a>' +
      '<span class="translation" lang="ar" dir="rtl">أَرْشِيفُ الْأَعْمَالِ</span>' +
      '<p class="project-code">' +
        escapeHTML(numberLabel(index + 1)) + ' / ' +
        escapeHTML(project.category || 'project') +
      '</p>' +
      '<h1>' + escapeHTML(projectTitle(project)) + '</h1>' +
      '<div class="it">' +
        paragraphs(project.description || project.about ||
          project.text || project.summary || '') +
      '</div>';

    if (notes) {
      sidebar += '<h3>project notes</h3><ul class="cl">' + notes + '</ul>';
    }

    sidebar += '</aside>';

    return '<section class="pj">' +
      '<div class="sqs">' +
        (gallery || '<div class="sq"><span class="art">' +
          artwork(project, 0) + '</span></div>') +
      '</div>' +
      sidebar +
    '</section>';
  }

  /* ----------------------------------------
     3D RING MOVEMENT
  ---------------------------------------- */

  function setupRing() {
    if (cleanupRing) {
      cleanupRing();
      cleanupRing = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    const scene = document.querySelector('.ring-scene');
    const ring = scene && scene.querySelector('.archive-ring');

    if (!scene || !ring) return;

    const cards = Array.from(ring.children);
    const count = cards.length;

    if (!count) return;

    let rotation = 0;
    let targetRotation = 0;
    let velocity = 0;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let lastX = 0;
    let pointerId = null;
    let lastMouseX = null;
    let suppressClick = false;
    let suppressTimer = null;
    let destroyed = false;

    const reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw() {
      ring.style.transform =
        'rotateX(-7deg) rotateY(' + rotation + 'deg)';

      cards.forEach(function (card, index) {
        const angle = (index * 360 / count + rotation) * Math.PI / 180;
        card.style.zIndex = String(Math.round((Math.cos(angle) + 1) * 1000));
      });
    }

    function arrange() {
      const mobile = window.innerWidth <= 560;
      const cardWidth = mobile ? 132 : 170;

      /*
       * Smaller radius = cards closer together.
       * The radius grows gradually with the number of projects.
       */
      let radius;

      if (count === 1) {
        radius = 0;
      } else if (count === 2) {
        radius = cardWidth * 0.58;
      } else {
        const naturalRadius = cardWidth / (2 * Math.tan(Math.PI / count));
        const minimumRadius = mobile ? 145 : 180;
        const maximumRadius = mobile ? 290 : 350;

        radius = Math.max(
          minimumRadius,
          Math.min(maximumRadius, naturalRadius * 0.82)
        );
      }

      cards.forEach(function (card, index) {
        card.style.transform =
          'translate(-50%, -50%) rotateY(' +
          (index * 360 / count) +
          'deg) translateZ(' + radius + 'px)';
      });

      draw();
    }

    function animate() {
      if (destroyed) return;

      if (reduceMotion) {
        rotation = targetRotation;
        velocity = 0;
        draw();
        return;
      }

      if (!animationFrame) {
        animationFrame = requestAnimationFrame(tick);
      }
    }

    function tick() {
      animationFrame = 0;

      if (destroyed) return;

      const difference = targetRotation - rotation;

      velocity += difference * 0.075;
      velocity *= 0.78;
      rotation += velocity;

      if (
        Math.abs(difference) < 0.025 &&
        Math.abs(velocity) < 0.025
      ) {
        rotation = targetRotation;
        velocity = 0;
        draw();
        return;
      }

      draw();
      animationFrame = requestAnimationFrame(tick);
    }

    function onPointerMove(event) {
      if (event.pointerType === 'mouse') {
        if (dragging || window.innerWidth <= 560) return;

        if (lastMouseX === null) {
          lastMouseX = event.clientX;
          return;
        }

        const delta = event.clientX - lastMouseX;
        lastMouseX = event.clientX;

        if (Math.abs(delta) < 90) {
          targetRotation += delta * 0.42;
          animate();
        }

        return;
      }

      if (!dragging || event.pointerId !== pointerId) return;

      const delta = event.clientX - lastX;

      if (Math.abs(event.clientX - startX) > 6) {
        moved = true;
      }

      if (moved) {
        targetRotation += delta * 0.5;
        animate();
      }

      lastX = event.clientX;
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
        } catch (error) {
          /* Pointer capture is optional. */
        }
      }
    }

    function onPointerUp(event) {
      if (!dragging) return;
      if (event.pointerId != null && event.pointerId !== pointerId) return;

      dragging = false;
      scene.classList.remove('is-dragging');

      if (moved) {
        suppressClick = true;
        clearTimeout(suppressTimer);

        suppressTimer = setTimeout(function () {
          suppressClick = false;
          suppressTimer = null;
        }, 250);
      }

      pointerId = null;
      lastMouseX = null;
    }

    function onClick(event) {
      const card = event.target.closest &&
        event.target.closest('a.ring-card');

      if (!card) return;

      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
        clearTimeout(suppressTimer);
        suppressTimer = null;
      }
    }

    function onResize() {
      lastMouseX = null;
      arrange();
    }

    scene.addEventListener('pointermove', onPointerMove);
    scene.addEventListener('pointerleave', function () {
      lastMouseX = null;
    });
    scene.addEventListener('pointerdown', onPointerDown);
    scene.addEventListener('pointerup', onPointerUp);
    scene.addEventListener('pointercancel', onPointerUp);
    scene.addEventListener('click', onClick, true);
    window.addEventListener('resize', onResize);

    arrange();

    cleanupRing = function () {
      destroyed = true;

      scene.removeEventListener('pointermove', onPointerMove);
      scene.removeEventListener('pointerdown', onPointerDown);
      scene.removeEventListener('pointerup', onPointerUp);
      scene.removeEventListener('pointercancel', onPointerUp);
      scene.removeEventListener('click', onClick, true);
      window.removeEventListener('resize', onResize);

      clearTimeout(suppressTimer);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };
  }

  /* ----------------------------------------
     ROUTER
  ---------------------------------------- */

  function renderRoute() {
    const parts = window.location.hash
      .replace(/^#\/?/, '')
      .split('/')
      .filter(Boolean);

    const page = parts[0] || 'home';
    const id = parts[1];
    let title = 'حبيبه — visual creative';

    if (page === 'work' && id) {
      app.innerHTML = renderProject(id);

      const found = findProject(id);

      if (found) {
        title = projectTitle(found.project) + ' — حبيبه';
      }

      if (cleanupRing) {
        cleanupRing();
        cleanupRing = null;
      }
    } else {
      if (cleanupRing) {
        cleanupRing();
        cleanupRing = null;
      }

      switch (page) {
        case 'work':
          app.innerHTML =
            '<section class="archive-section work-page">' +
              renderFilters() +
              '<div id="project-ring-results">' +
                renderCards(filteredProjects(currentFilter)) +
              '</div>' +
            '</section>';
          title = 'work — حبيبه';
          break;

        case 'about':
          app.innerHTML = renderAbout();
          title = 'about — حبيبه';
          break;

        case 'contact':
          app.innerHTML = renderContact();
          title = 'contact — حبيبه';
          break;

        default:
          app.innerHTML =
            hero() +
            '<section class="archive-section">' +
              '<div class="archive-content">' +
                renderCards(filteredProjects('all')) +
              '</div>' +
            '</section>';
          break;
      }

      setupRing();
    }

    document.title = title;
    app.setAttribute('aria-busy', 'false');

    document.querySelectorAll('.main-nav a').forEach(function (link) {
      const target = link.getAttribute('href')
        .replace(/^#\/?/, '')
        .split('/')[0];

      if (target === page) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ----------------------------------------
     CLICK HANDLERS
  ---------------------------------------- */

  document.addEventListener('click', function (event) {
    const filterButton = event.target.closest('[data-filter]');

    if (filterButton) {
      currentFilter = filterButton.getAttribute('data-filter') || 'all';

      if (window.location.hash.replace(/^#\/?/, '').split('/')[0] !== 'work') {
        window.location.hash = '#/work';
        return;
      }

      document.querySelectorAll('[data-filter]').forEach(function (button) {
        button.setAttribute(
          'aria-pressed',
          button.getAttribute('data-filter').toLowerCase() ===
          currentFilter.toLowerCase() ? 'true' : 'false'
        );
      });

      const results = document.getElementById('project-ring-results');

      if (results) {
        if (cleanupRing) {
          cleanupRing();
          cleanupRing = null;
        }

        results.innerHTML = renderCards(filteredProjects(currentFilter));
        setupRing();
      }

      return;
    }

    const imageButton = event.target.closest('[data-lightbox-index]');

    if (imageButton) {
      const id = window.location.hash
        .replace(/^#\/?/, '')
        .split('/')[1];

      const found = findProject(id);

      if (found) {
        openImage(found.project, Number(imageButton.getAttribute('data-lightbox-index')));
      }
    }
  });

  /* ----------------------------------------
     IMAGE VIEWER
  ---------------------------------------- */

  function openImage(project, index) {
    lightboxContent.innerHTML = artwork(project, index);

    const image = lightboxContent.querySelector('img');

    if (image) {
      image.removeAttribute('loading');
    }

    if (typeof lightbox.showModal === 'function') {
      lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }
  }

  function closeImage() {
    if (lightbox.open && typeof lightbox.close === 'function') {
      lightbox.close();
    } else {
      lightbox.removeAttribute('open');
    }
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeImage);
  }

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) {
      closeImage();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && lightbox.open) {
      closeImage();
    }
  });

  /* ----------------------------------------
     LOAD SITE DATA
  ---------------------------------------- */

  function loadJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) {
        throw new Error('Could not load ' + url + ' (' + response.status + ')');
      }

      return response.json();
    });
  }

  Promise.all([
    loadJSON('data/site.json'),
    loadJSON('data/projects.json')
  ]).then(function (data) {
    site = data[0] && typeof data[0] === 'object' ? data[0] : {};

    const projectData = data[1];

    projects = Array.isArray(projectData)
      ? projectData
      : (projectData && Array.isArray(projectData.projects)
        ? projectData.projects
        : []);

    renderFooter();
    renderRoute();
  }).catch(function (error) {
    console.error('Portfolio loading error:', error);

    app.setAttribute('aria-busy', 'false');
    app.innerHTML =
      '<section class="about">' +
        '<h1>could not load the portfolio</h1>' +
        '<p>Please check that data/site.json and data/projects.json contain valid JSON.</p>' +
        '<p>Open the browser console for the exact error.</p>' +
      '</section>';

    renderFooter();
  });

  window.addEventListener('hashchange', renderRoute);
})();
