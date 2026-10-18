(function () {
  'use strict';

  var app = document.getElementById('app');
  var foot = document.getElementById('foot');
  var lb = document.getElementById('lb');
  var lbc = document.getElementById('lbc');

  var S = {};
  var P = [];
  var started = false;

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

  function codeNumber(number) {
    return 'CODE_' + String(number).padStart(3, '0');
  }

  function circ(number) {
    return number <= 20
      ? String.fromCharCode(9311 + number)
      : number;
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

    if (!image) {
      return ph(project, index, imageIndex);
    }

    return '<img src="' + esc(image) + '" alt="' +
      esc(project.title) + ', image ' + (imageIndex + 1) +
      '" loading="lazy">';
  }

  function items(category) {
    return P.map(function (project, index) {
      return [project, index];
    }).filter(function (item) {
      return !category ||
        category === 'All' ||
        item[0].category === category;
    });
  }

  function lib(list) {
    if (!list.length) {
      return '<p class="txt">No projects in this category yet.</p>';
    }

    var groups = [];
    var groupMap = Object.create(null);

    list.forEach(function (item) {
      var project = item[0];
      var category = String(project.category || 'uncategorized');
      var key = category.toLowerCase();

      if (!groupMap[key]) {
        groupMap[key] = {
          name: category,
          projects: []
        };
        groups.push(groupMap[key]);
      }

      groupMap[key].projects.push(item);
    });

    var sections = groups.map(function (group, groupIndex) {
      var code = codeNumber(groupIndex + 1);

      var projects = group.projects.map(function (item) {
        var project = item[0];
        var index = item[1];

        return '<a class="folder-project" href="#/work/' +
          pid(project, index) + '" aria-label="' +
          esc(project.title) + '">' +
          '<span class="folder-project-art">' +
          art(project, index, 0) +
          '</span>' +
          '<span class="project-caption">' +
          '<span class="folder-project-number">' +
          code + ' / ' + pad(index + 1) +
          '</span>' +
          '<span class="folder-project-name">' +
          esc(project.title) +
          '</span>' +
          '<span class="folder-project-arrow" aria-hidden="true">↗</span>' +
          '</span></a>';
      }).join('');

      return '<details class="archive-folder archive-folder-' +
        ((groupIndex % 5) + 1) + '"' +
        (groupIndex === 0 ? ' open' : '') + '>' +
        '<summary class="archive-folder-tab">' +
        '<span class="folder-label">' +
        '<span class="folder-number">' + code + '</span>' +
        '<span class="folder-name">' + esc(group.name) + '</span>' +
        '</span>' +
        '<span class="folder-count">' +
        pad(group.projects.length) + '</span>' +
        '<span class="folder-icon" aria-hidden="true">↗</span>' +
        '</summary>' +
        '<div class="folder-content">' +
        '<div class="folder-section-heading">' +
        '<span>HABIBAH / ' + esc(group.name) + '</span>' +
        '<span>' + pad(group.projects.length) + ' PROJECTS</span>' +
        '</div>' +
        '<div class="folder-projects">' + projects + '</div>' +
        '</div></details>';
    }).join('');

    return '<div class="archive-accordion">' +
      '<div class="archive-file-header">' +
      '<div class="archive-file-heading">' +
      '<span class="archive-file-kicker">VISUAL INDEX / 2026</span>' +
      '<span class="archive-file-title-main">habibah / archive</span>' +
      '<span class="archive-file-ar" lang="ar" dir="rtl">مَلَفّ الأَعْمَال</span>' +
      '</div>' +
      '<div class="archive-file-total">' +
      '<span>' + pad(list.length) + '</span>' +
      '<span>PROJECTS</span>' +
      '</div></div>' +
      '<div class="archive-folder-stack">' + sections + '</div>' +
      '<div class="archive-drawer-bottom">' +
      '<span>INDEPENDENT VISUAL ARCHIVE</span>' +
      '<span>' + pad(groups.length) + ' FILES / INDEXED</span>' +
      '</div></div>';
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
      '<span class="translation" lang="ar" dir="rtl">مَلَفّ الأَقْسَام</span>' +
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
      return '<p class="txt">Project not found. ' +
        '<a href="#/work">Back to work</a></p>';
    }

    var count = Math.max((item.images || []).length, 4);
    var gallery = '';
    var captions = '';
    var description = String(item.description || '').split(/\n\s*\n/);

    for (var j = 0; j < count; j++) {
      gallery += '<figure class="sq" tabindex="0" role="button" ' +
        'aria-label="View image ' + (j + 1) + ' larger">' +
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
      app.innerHTML = '<p class="txt">This page could not be displayed. ' +
        '<a href="#/">Return home</a></p>';
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
      '<p class="txt">Please refresh the page or try again later.</p>' +
      '<button type="button" id="retry-load">try again</button>' +
      '</section>';

    var retry = document.getElementById('retry-load');

    if (retry) {
      retry.addEventListener('click', start);
    }
  }

  function loadJSON(url) {
    var controller = typeof AbortController !== 'undefined'
      ? new AbortController()
      : null;

    var timer = controller
      ? setTimeout(function () {
          controller.abort();
        }, 12000)
      : null;

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
