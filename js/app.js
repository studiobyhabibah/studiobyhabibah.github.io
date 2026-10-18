(function () {
  'use strict';

  var app = document.getElementById('app');
  var foot = document.getElementById('foot');
  var lb = document.getElementById('lb');
  var lbc = document.getElementById('lbc');

  var S, P;

  var tones = ['olive', 'avo', 'blue', 'yellow', 'brown', 'pink'];
  var acc = ['pink', 'blue', 'yellow', 'avo'];

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[c];
    });
  }

  function slug(t) {
    return String(t).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function pid(p, i) {
    return (i + 1) + '-' + slug(p.title);
  }

  function paras(t) {
    return String(t || '')
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map(function (x) {
        return '<p>' + esc(x) + '</p>';
      }).join('');
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function codeNumber(n) {
    return 'CODE_' + String(n).padStart(3, '0');
  }

  function circ(n) {
    return n <= 20 ? String.fromCharCode(9311 + n) : n;
  }

  function src(p, j) {
    var e = p.images && p.images[j];
    e = e && (e.image || e);
    return e ? String(e).replace(/^\/+/, '') : '';
  }

  function cap(p, j) {
    var e = p.images && p.images[j];
    return (e && e.caption) || '';
  }

  function ph(p, i, j) {
    var n = i + j;

    var shapes = [
      '<path d="M90 420V230a110 110 0 0 1 220 0v190z"/>',
      '<circle cx="200" cy="240" r="120"/>',
      '<path d="M80 300c-20-90 60-170 150-150s110 120 60 200-190 60-210-50z"/>',
      '<rect x="90" y="130" width="50" height="290"/>' +
        '<rect x="175" y="190" width="50" height="230"/>' +
        '<rect x="260" y="100" width="50" height="320"/>'
    ];

    return '<svg viewBox="0 0 400 500" role="img" aria-label="' +
      esc(p.title) + '" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="400" height="500" style="fill:var(--' +
      tones[n % 6] + ')"/>' +
      '<g style="fill:var(--' + acc[(n + 1) % 4] +
      ')" transform="rotate(' + (n * 7 - 6) +
      ' 200 250)">' + shapes[n % 4] + '</g>' +
      '<circle cx="320" cy="90" r="22" style="fill:var(--soft)"/>' +
      '</svg>';
  }

  function art(p, i, j) {
    var s = src(p, j);

    return s
      ? '<img src="' + esc(s) + '" alt="' + esc(p.title) +
        ', image ' + (j + 1) + '" loading="lazy">'
      : ph(p, i, j);
  }

  function items(category) {
    return P.map(function (p, i) {
      return [p, i];
    }).filter(function (x) {
      return !category ||
        category === 'All' ||
        x[0].category === category;
    });
  }

  /* ==========================================
     CODE ARCHIVE — EDITORIAL FILE FOLDERS
     ========================================== */

  function lib(list) {
    if (!list.length) {
      return '<p class="txt">No projects in this category yet.</p>';
    }

    var groups = [];
    var groupMap = Object.create(null);

    list.forEach(function (x) {
      var p = x[0];
      var category = String(p.category || 'uncategorized');
      var key = category.toLowerCase();

      if (!groupMap[key]) {
        groupMap[key] = {
          name: category,
          projects: []
        };

        groups.push(groupMap[key]);
      }

      groupMap[key].projects.push(x);
    });

    var sections = groups.map(function (group, index) {
      var code = codeNumber(index + 1);

      var projects = group.projects.map(function (x) {
        var p = x[0];
        var i = x[1];

        return '<a class="folder-project" href="#/work/' +
          pid(p, i) + '" aria-label="' + esc(p.title) + '">' +

          '<span class="folder-project-art">' +
            art(p, i, 0) +
          '</span>' +

          '<span class="project-caption">' +
            '<span class="folder-project-number">' +
              code + ' / ' + pad(i + 1) +
            '</span>' +

            '<span class="folder-project-name">' +
              esc(p.title) +
            '</span>' +

            '<span class="folder-project-arrow" aria-hidden="true">' +
              '↗' +
            '</span>' +
          '</span>' +

        '</a>';
      }).join('');

      return '<details class="archive-folder archive-folder-' +
        ((index % 5) + 1) + '"' +
        (index === 0 ? ' open' : '') + '>' +

        '<summary class="archive-folder-tab">' +

          '<span class="folder-label">' +
            '<span class="folder-number">' + code + '</span>' +
            '<span class="folder-name">' + esc(group.name) + '</span>' +
          '</span>' +

          '<span class="folder-count">' +
            pad(group.projects.length) +
          '</span>' +

          '<span class="folder-icon" aria-hidden="true">↗</span>' +

        '</summary>' +

        '<div class="folder-content">' +

          '<div class="folder-section-heading">' +
            '<span>HABIBAH / ' + esc(group.name) + '</span>' +
            '<span>' + pad(group.projects.length) + ' PROJECTS</span>' +
          '</div>' +

          '<div class="folder-projects">' + projects + '</div>' +

        '</div>' +

      '</details>';
    }).join('');

    return '<div class="archive-accordion">' +

      '<div class="archive-file-header">' +

        '<div class="archive-file-heading">' +
          '<span class="archive-file-kicker">' +
            'VISUAL INDEX / 2026' +
          '</span>' +

          '<span class="archive-file-title-main">' +
            'habibah / archive' +
          '</span>' +

          '<span class="archive-file-ar" lang="ar" dir="rtl">' +
            'مَلَفّ الأَعْمَال' +
          '</span>' +
        '</div>' +

        '<div class="archive-file-total">' +
          '<span>' + pad(list.length) + '</span>' +
          '<span>PROJECTS</span>' +
        '</div>' +

      '</div>' +

      '<div class="archive-folder-stack">' +
        sections +
      '</div>' +

      '<div class="archive-drawer-bottom">' +
        '<span>INDEPENDENT VISUAL ARCHIVE</span>' +
        '<span>' + pad(groups.length) + ' FILES / INDEXED</span>' +
      '</div>' +

    '</div>';
  }

  /* ==========================================
     HOMEPAGE INTRO
     ========================================== */

  function hero() {
    return '<section class="intro">' +

      '<div class="intro-name">' +
        '<h1 lang="ar" dir="rtl">حبيبه</h1>' +
        '<p class="intro-title">visual creative</p>' +
        '<span class="translation" lang="ar" dir="rtl">' +
          'مُبْدِعَةٌ بَصَرِيَّةٌ' +
        '</span>' +
      '</div>' +

      '<p class="intro-description">' +
        esc(S.intro || S.tagline || '') +
      '</p>' +

    '</section>';
  }

  /* ==========================================
     BILINGUAL NAVIGATION LABELS
     ========================================== */

  function tr(en, ar) {
    return '<span class="nav-label">' +
      '<span class="nav-en">' + en + '</span>' +
      '<span class="translation" lang="ar" dir="rtl">' +
        ar +
      '</span>' +
    '</span>';
  }

  function archiveHeading() {
    return '<div class="archive-heading">' +

      '<div>' +
        '<h2>the archive</h2>' +
        '<span class="translation" lang="ar" dir="rtl">' +
          'مَلَفّ الأَقْسَام' +
        '</span>' +
      '</div>' +

      '<p>a collection of visual experiments and projects</p>' +

    '</div>';
  }

  /* ==========================================
     PAGES
     ========================================== */

  var views = {
    home: function () {
      return hero() +

        '<section class="archive-section">' +
          archiveHeading() +
          lib(items()) +

          '<p class="archive-more">' +
            '<a href="#/work">' +
              tr('view all work', 'عَرْضُ كُلِّ الْأَعْمَالِ') +
            '</a>' +
          '</p>' +

        '</section>';
    },

    work: function () {
      return '<section class="archive-section">' +

        archiveHeading() +

        '<div class="filters" role="group" aria-label="Filter by category">' +

          ['All'].concat(S.categories || []).map(function (c) {
            return '<button type="button" aria-pressed="' +
              (c === 'All') +
              '" data-c="' + esc(c) + '">' +
              esc(c) +
            '</button>';
          }).join('') +

        '</div>' +

        '<div id="g">' + lib(items()) + '</div>' +

      '</section>';
    },

    about: function () {
      return '<section class="about">' +

        '<h1>about</h1>' +

        '<span class="translation" lang="ar" dir="rtl">' +
          'مَنْ أَنَا' +
        '</span>' +

        '<div class="txt">' + paras(S.about) + '</div>' +

      '</section>';
    },

    contact: function () {
      var links = [
        '<a href="mailto:' + esc(S.email) + '">' +
          esc(S.email) +
        '</a>'
      ].concat((S.links || []).map(function (x) {
        return '<a href="' + esc(x.url) +
          '" target="_blank" rel="noopener">' +
          esc(x.label) +
        '</a>';
      }));

      return '<section class="links">' +

        '<div>' +
          '<h1>contact</h1>' +
          '<span class="translation" lang="ar" dir="rtl">' +
            'تَوَاصُل' +
          '</span>' +
        '</div>' +

        links.join('') +

      '</section>';
    }
  };

  /* ==========================================
     PROJECT DETAILS
     ========================================== */

  function project(id) {
    var match = String(id).match(/^(\d+)-/);
    var i = match ? parseInt(match[1], 10) - 1 : -1;
    var p = P[i];

    if (!p) {
      return '<p class="txt">Project not found. ' +
        '<a href="#/work">Back to work</a></p>';
    }

    var count = Math.max((p.images || []).length, 4);
    var gallery = '';
    var captions = '';

    var description = String(p.description || '')
      .split(/\n\s*\n/);

    for (var j = 0; j < count; j++) {
      gallery +=
        '<figure class="sq" tabindex="0" role="button" ' +
          'aria-label="View image ' + (j + 1) + ' larger">' +

          '<span class="num">' + circ(j + 1) + '</span>' +

          '<div class="art">' +
            art(p, i, j) +
          '</div>' +

        '</figure>';

      if (cap(p, j)) {
        captions +=
          '<li><span>' + circ(j + 1) + '</span>' +
            esc(cap(p, j)) +
          '</li>';
      }
    }

    return '<div class="pj">' +

      '<div class="sqs">' +
        gallery +
      '</div>' +

      '<aside>' +

        '<a href="#/work">back to work</a>' +

        '<span class="translation" lang="ar" dir="rtl">' +
          'الْعَوْدَةُ إِلَى الْأَعْمَالِ' +
        '</span>' +

        '<h1>' + esc(p.title) + '</h1>' +

        '<hr>' +

        '<p class="it">' + esc(description[0]) + '</p>' +

        (captions
          ? '<ul class="cl">' + captions + '</ul>'
          : '') +

        '<h3>details</h3>' +

        '<span class="translation" lang="ar" dir="rtl">' +
          'التَّفَاصِيل' +
        '</span>' +

        '<p class="meta">' +
          esc(p.category) +
          (p.year ? ', ' + esc(p.year) : '') +
        '</p>' +

        paras(description.slice(1).join('\n\n')) +

        (p.role
          ? '<h3>my role</h3>' +
            '<span class="translation" lang="ar" dir="rtl">' +
              'دَوْرِي' +
            '</span>' +
            '<p>' + esc(p.role) + '</p>'
          : '') +

        (p.process
          ? '<h3>process</h3>' +
            '<span class="translation" lang="ar" dir="rtl">' +
              'مَرَاحِلُ الْعَمَلِ' +
            '</span>' +
            paras(p.process)
          : '') +

      '</aside>' +

    '</div>';
  }

  /* ==========================================
     ROUTING
     ========================================== */

  function route() {
    var hash = location.hash.replace(/^#\/?/, '').split('/');
    var page = hash[0] || 'home';

    if (['home', 'work', 'about', 'contact'].indexOf(page) < 0) {
      page = 'home';
    }

    if (page === 'work' && hash[1]) {
      app.innerHTML = project(hash[1]);
    } else {
      app.innerHTML = views[page]();
    }

    document.title = (
      page === 'home' ? '' : page + ' | '
    ) + 'habibah';

    window.scrollTo(0, 0);

    [].forEach.call(document.querySelectorAll('header nav a'), function (a) {
      var href = a.getAttribute('href');

      if (href === '#/' + page) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  /* ==========================================
     IMAGE VIEWER
     ========================================== */

  function openImage(el) {
    var artwork = el.querySelector('.art');

    if (!artwork || !lb || !lbc) {
      return;
    }

    lbc.innerHTML = artwork.innerHTML;

    if (typeof lb.showModal === 'function') {
      lb.showModal();
    }
  }

  document.addEventListener('click', function (e) {
    var filter = e.target.closest('button[data-c]');
    var image = e.target.closest('.sq');

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

    } else if (e.target.id === 'lbx' || e.target === lb) {
      if (lb) {
        lb.close();
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    var image = e.target.closest && e.target.closest('.sq');

    if (image && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openImage(image);
    }
  });

  /* ==========================================
     LOAD CONTENT
     ========================================== */

  function load(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) {
        throw new Error('Could not load ' + url);
      }

      return response.json();
    });
  }

  Promise.all([
    load('data/site.json'),
    load('data/projects.json')
  ]).then(function (results) {
    S = results[0];
    P = results[1].projects || [];

    /* FOOTER */

    foot.innerHTML =
      '<div class="bar">' +

        '<div class="big">habibah</div>' +

        '<a href="#/">' +
          tr('home', 'الرَّئِيسِيَّة') +
        '</a>' +

        '<a href="#/work">' +
          tr('work', 'الْأَعْمَال') +
        '</a>' +

        '<a href="#/about">' +
          tr('about', 'مَنْ أَنَا') +
        '</a>' +

        '<a href="#/contact">' +
          tr('contact', 'تَوَاصُل') +
        '</a>' +

      '</div>';

    window.addEventListener('hashchange', route);
    route();

  }).catch(function (error) {
    console.error(error);

    app.innerHTML =
      '<p class="txt">The portfolio data could not load. ' +
      'Please open the published website and try again.</p>';
  });

})();
```
