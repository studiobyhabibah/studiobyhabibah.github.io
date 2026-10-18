(function () {
  'use strict';

  /* ========================================
     HABIBAH — PORTFOLIO JAVASCRIPT
     Archive + Filters + Project Pages
     + Image Viewer + Safe Data Loading
     ======================================== */

  function init() {
    var app = document.getElementById('app');
    var foot = document.getElementById('foot');
    var lb = document.getElementById('lb');
    var lbc = document.getElementById('lbc');

    var S = null;
    var P = [];

    var tones = ['olive', 'avo', 'blue', 'yellow', 'brown', 'pink'];
    var acc = ['pink', 'blue', 'yellow', 'avo'];

    /* ========================================
       HELPERS
       ======================================== */

    function esc(value) {
      return String(value == null ? '' : value).replace(
        /[&<>"']/g,
        function (char) {
          return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          }[char];
        }
      );
    }

    function slug(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    function pid(project, index) {
      return (index + 1) + '-' + slug(project.title);
    }

    function paras(value) {
      return String(value || '')
        .split(/\n\s*\n/)
        .filter(function (paragraph) {
          return paragraph.trim().length > 0;
        })
        .map(function (paragraph) {
          return '<p>' + esc(paragraph) + '</p>';
        })
        .join('');
    }

    function pad(number) {
      return number < 10 ? '0' + number : String(number);
    }

    function circ(number) {
      return number <= 20
        ? String.fromCharCode(9311 + number)
        : String(number);
    }

    function src(project, index) {
      var entry = project.images && project.images[index];

      entry = entry && (entry.image || entry);

      if (!entry || typeof entry !== 'string') {
        return '';
      }

      return entry.replace(/^\.\//, '').replace(/^\/+/, '');
    }

    function cap(project, index) {
      var entry = project.images && project.images[index];

      return entry && typeof entry === 'object'
        ? entry.caption || ''
        : '';
    }

    function getCategory(project) {
      return String(project.category || 'Uncategorized');
    }

    /* ========================================
       PLACEHOLDER ARTWORK
       ======================================== */

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

      return (
        '<svg viewBox="0 0 400 500" role="img" aria-label="' +
        esc(project.title) +
        '" preserveAspectRatio="xMidYMid slice">' +

          '<rect width="400" height="500" style="fill:var(--' +
            tones[n % tones.length] +
          ')"/>' +

          '<g style="fill:var(--' +
            acc[(n + 1) % acc.length] +
          ')" transform="rotate(' +
            (n * 7 - 6) +
            ' 200 250)">' +
            shapes[n % shapes.length] +
          '</g>' +

          '<circle cx="320" cy="90" r="22" style="fill:var(--soft)"/>' +

        '</svg>'
      );
    }

    function art(project, index, imageIndex) {
      var imageSource = src(project, imageIndex);

      if (!imageSource) {
        return ph(project, index, imageIndex);
      }

      return (
        '<img src="' + esc(imageSource) +
        '" alt="' + esc(project.title) +
        ', image ' + (imageIndex + 1) +
        '" loading="lazy" decoding="async" ' +
        'onerror="this.onerror=null;this.style.display=\'none\'">'
      );
    }

    /* ========================================
       PROJECT FILTERING
       ======================================== */

    function items(category) {
      return P.map(function (project, index) {
        return [project, index];
      }).filter(function (item) {
        return (
          !category ||
          category === 'All' ||
          getCategory(item[0]).toLowerCase() ===
            String(category).toLowerCase()
        );
      });
    }

    /* ========================================
       ACCORDION ARCHIVE
       ======================================== */

    function lib(list) {
      if (!list.length) {
        return '<p class="txt">No projects in this category yet.</p>';
      }

      var groups = [];
      var groupMap = Object.create(null);

      list.forEach(function (item) {
        var project = item[0];
        var category = getCategory(project);
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
        var projects = group.projects.map(function (item) {
          var project = item[0];
          var index = item[1];

          return (
            '<a class="folder-project" href="#/work/' +
              pid(project, index) +
              '" aria-label="' + esc(project.title) + '">' +

              '<span class="folder-project-art">' +
                art(project, index, 0) +
              '</span>' +

              '<span class="project-caption">' +

                '<span class="folder-project-number">' +
                  pad(index + 1) +
                '</span>' +

                '<span class="folder-project-name">' +
                  esc(project.title) +
                '</span>' +

                '<span class="folder-project-arrow" aria-hidden="true">' +
                  '↗' +
                '</span>' +

              '</span>' +

            '</a>'
          );
        }).join('');

        return (
          '<details class="archive-folder"' +
            (groupIndex === 0 ? ' open' : '') +
          '>' +

            '<summary class="archive-folder-tab">' +

              '<span class="folder-label">' +

                '<span class="folder-number">' +
                  pad(groupIndex + 1) +
                '</span>' +

                '<span class="folder-name">' +
                  esc(group.name) +
                '</span>' +

              '</span>' +

              '<span class="folder-count">' +
                pad(group.projects.length) +
              '</span>' +

              '<span class="folder-icon" aria-hidden="true">' +
                '+' +
              '</span>' +

            '</summary>' +

            '<div class="folder-content">' +

              '<div class="folder-section-heading">' +
                '<span>habibah / ' + esc(group.name) + '</span>' +
                '<span>' + pad(group.projects.length) + ' projects</span>' +
              '</div>' +

              '<div class="folder-projects">' +
                projects +
              '</div>' +

            '</div>' +

          '</details>'
        );
      }).join('');

      return (
        '<div class="archive-accordion">' +

          '<div class="archive-file-header">' +

            '<div class="archive-file-heading">' +
              '<span class="archive-file-kicker">personal collection</span>' +
              '<span class="archive-file-title-main">habibah / archive</span>' +
              '<span class="archive-file-ar" lang="ar" dir="rtl">' +
                'مَلَفّ الأَعْمَال' +
              '</span>' +
            '</div>' +

            '<div class="archive-file-total">' +
              '<span>' + pad(list.length) + '</span>' +
              '<span>projects</span>' +
            '</div>' +

          '</div>' +

          '<div class="archive-folder-stack">' +
            sections +
          '</div>' +

          '<div class="archive-drawer-bottom">' +
            '<span>visual archive / habibah</span>' +
            '<span>' + pad(groups.length) + ' sections</span>' +
          '</div>' +

        '</div>'
      );
    }

    /* ========================================
       HOMEPAGE INTRO
       ======================================== */

    function hero() {
      return (
        '<section class="intro">' +

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

        '</section>'
      );
    }

    /* ========================================
       BILINGUAL LABELS
       ======================================== */

    function tr(english, arabic) {
      return (
        '<span class="nav-label">' +
          '<span class="nav-en">' + english + '</span>' +
          '<span class="translation" lang="ar" dir="rtl">' +
            arabic +
          '</span>' +
        '</span>'
      );
    }

    function archiveHeading() {
      return (
        '<div class="archive-heading">' +

          '<div>' +
            '<h2>the archive</h2>' +
            '<span class="translation" lang="ar" dir="rtl">' +
              'مَلَفّ الأَقْسَام' +
            '</span>' +
          '</div>' +

          '<p>a collection of visual experiments and projects</p>' +

        '</div>'
      );
    }

    /* ========================================
       PAGE VIEWS
       ======================================== */

    var views = {
      home: function () {
        return (
          hero() +

          '<section class="archive-section">' +
            archiveHeading() +
            lib(items()) +

            '<p class="archive-more">' +
              '<a href="#/work">' +
                tr('view all work', 'عَرْضُ كُلِّ الْأَعْمَالِ') +
              '</a>' +
            '</p>' +

          '</section>'
        );
      },

      work: function () {
        var categories = ['All'];

        (S.categories || []).forEach(function (category) {
          if (
            typeof category === 'string' &&
            !categories.some(function (existing) {
              return existing.toLowerCase() === category.toLowerCase();
            })
          ) {
            categories.push(category);
          }
        });

        return (
          '<section class="archive-section">' +

            archiveHeading() +

            '<div class="filters" role="group" aria-label="Filter by category">' +

              categories.map(function (category) {
                return (
                  '<button type="button" aria-pressed="' +
                    (category === 'All' ? 'true' : 'false') +
                    '" data-c="' + esc(category) + '">' +
                    esc(category) +
                  '</button>'
                );
              }).join('') +

            '</div>' +

            '<div id="g">' + lib(items()) + '</div>' +

          '</section>'
        );
      },

      about: function () {
        return (
          '<section class="about">' +

            '<h1>about</h1>' +

            '<span class="translation" lang="ar" dir="rtl">' +
              'مَنْ أَنَا' +
            '</span>' +

            '<div class="txt">' +
              paras(S.about) +
            '</div>' +

          '</section>'
        );
      },

      contact: function () {
        var links = [];

        if (S.email) {
          links.push(
            '<a href="mailto:' + esc(S.email) + '">' +
              esc(S.email) +
            '</a>'
          );
        }

        (S.links || []).forEach(function (link) {
          if (!link || !link.url || !link.label) {
            return;
          }

          links.push(
            '<a href="' + esc(link.url) +
              '" target="_blank" rel="noopener noreferrer">' +
              esc(link.label) +
            '</a>'
          );
        });

        return (
          '<section class="links">' +

            '<div>' +
              '<h1>contact</h1>' +
              '<span class="translation" lang="ar" dir="rtl">' +
                'تَوَاصُل' +
              '</span>' +
            '</div>' +

            links.join('') +

          '</section>'
        );
      }
    };

    /* ========================================
       PROJECT DETAILS
       ======================================== */

    function project(id) {
      var match = String(id || '').match(/^(\d+)-/);
      var index = match ? parseInt(match[1], 10) - 1 : -1;
      var current = P[index];

      if (
        !current ||
        pid(current, index) !== String(id)
      ) {
        return (
          '<p class="txt">' +
            'Project not found. ' +
            '<a href="#/work">Back to work</a>' +
          '</p>'
        );
      }

      var imageCount = Math.max(
        (current.images || []).length,
        4
      );

      var gallery = '';
      var captions = '';

      var description = String(current.description || '')
        .split(/\n\s*\n/);

      for (var j = 0; j < imageCount; j++) {
        gallery += (
          '<figure class="sq" tabindex="0" role="button" ' +
            'aria-label="View image ' + (j + 1) + ' larger">' +

            '<span class="num">' +
              circ(j + 1) +
            '</span>' +

            '<div class="art">' +
              art(current, index, j) +
            '</div>' +

          '</figure>'
        );

        var caption = cap(current, j);

        if (caption) {
          captions += (
            '<li>' +
              '<span>' + circ(j + 1) + '</span>' +
              esc(caption) +
            '</li>'
          );
        }
      }

      return (
        '<div class="pj">' +

          '<div class="sqs">' +
            gallery +
          '</div>' +

          '<aside>' +

            '<a href="#/work">back to work</a>' +

            '<span class="translation" lang="ar" dir="rtl">' +
              'الْعَوْدَةُ إِلَى الْأَعْمَالِ' +
            '</span>' +

            '<h1>' + esc(current.title) + '</h1>' +

            '<hr>' +

            '<p class="it">' +
              esc(description[0]) +
            '</p>' +

            (captions
              ? '<ul class="cl">' + captions + '</ul>'
              : '') +

            '<h3>details</h3>' +

            '<span class="translation" lang="ar" dir="rtl">' +
              'التَّفَاصِيل' +
            '</span>' +

            '<p class="meta">' +
              esc(getCategory(current)) +
              (current.year ? ', ' + esc(current.year) : '') +
            '</p>' +

            paras(description.slice(1).join('\n\n')) +

            (current.role
              ? '<h3>my role</h3>' +
                '<span class="translation" lang="ar" dir="rtl">' +
                  'دَوْرِي' +
                '</span>' +
                '<p>' + esc(current.role) + '</p>'
              : '') +

            (current.process
              ? '<h3>process</h3>' +
                '<span class="translation" lang="ar" dir="rtl">' +
                  'مَرَاحِلُ الْعَمَلِ' +
                '</span>' +
                paras(current.process)
              : '') +

          '</aside>' +

        '</div>'
      );
    }

    /* ========================================
       NAVIGATION
       ======================================== */

    function route() {
      if (!app || !S) {
        return;
      }

      var hash = location.hash
        .replace(/^#\/?/, '')
        .split('/');

      var page = hash[0] || 'home';

      if (!Object.prototype.hasOwnProperty.call(views, page)) {
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

      document.querySelectorAll('header nav a').forEach(function (link) {
        var href = link.getAttribute('href');

        if (href === '#/' + page) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    /* ========================================
       IMAGE VIEWER
       ======================================== */

    function openImage(element) {
      var artwork = element.querySelector('.art');

      if (!artwork || !lb || !lbc) {
        return;
      }

      lbc.replaceChildren();

      Array.from(artwork.childNodes).forEach(function (node) {
        lbc.appendChild(node.cloneNode(true));
      });

      var image = lbc.querySelector('img');

      if (image) {
        image.loading = 'eager';
        image.removeAttribute('onerror');
        image.onerror = function () {
          image.alt = 'Image unavailable';
        };
      }

      if (typeof lb.showModal === 'function') {
        if (!lb.open) {
          lb.showModal();
        }
      } else {
        lb.setAttribute('open', '');
      }
    }

    function closeImage() {
      if (!lb) {
        return;
      }

      if (typeof lb.close === 'function' && lb.open) {
        lb.close();
      } else {
        lb.removeAttribute('open');
      }
    }

    /* ========================================
       CLICK EVENTS
       ======================================== */

    document.addEventListener('click', function (event) {
      var target = event.target;

      if (!target || typeof target.closest !== 'function') {
        return;
      }

      var filter = target.closest('button[data-c]');
      var image = target.closest('.sq');

      if (filter) {
        var selectedCategory = filter.getAttribute('data-c');
        var filterGroup = filter.parentNode;

        Array.from(filterGroup.children).forEach(function (button) {
          if (button.matches('button[data-c]')) {
            button.setAttribute(
              'aria-pressed',
              button === filter ? 'true' : 'false'
            );
          }
        });

        var grid = document.getElementById('g');

        if (grid) {
          grid.innerHTML = lib(items(selectedCategory));
        }

        return;
      }

      if (image) {
        event.preventDefault();
        openImage(image);
        return;
      }

      if (
        target.id === 'lbx' ||
        target === lb
      ) {
        closeImage();
      }
    });

    /* ========================================
       KEYBOARD ACCESSIBILITY
       ======================================== */

    document.addEventListener('keydown', function (event) {
      var target = event.target;

      if (!target || typeof target.closest !== 'function') {
        return;
      }

      var image = target.closest('.sq');

      if (
        image &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        openImage(image);
      }

      if (event.key === 'Escape' && lb && lb.open) {
        closeImage();
      }
    });

    /* ========================================
       LOAD JSON DATA
       ======================================== */

    function load(url) {
      return fetch(url, {
        cache: 'no-cache'
      }).then(function (response) {
        if (!response.ok) {
          throw new Error(
            'Failed to load ' + url +
            ' (HTTP ' + response.status + ')'
          );
        }

        return response.json().catch(function () {
          throw new Error(
            'Invalid JSON in ' + url +
            '. Check the file syntax.'
          );
        });
      });
    }

    function showLoadError(error) {
      console.error('[Habibah Portfolio]', error);

      if (!app) {
        return;
      }

      app.innerHTML = (
        '<section class="about">' +
          '<h1>Unable to load portfolio</h1>' +
          '<p class="txt">' +
            'The portfolio data could not be loaded. ' +
            'Please check the JSON files and try again.' +
          '</p>' +
        '</section>'
      );
    }

    if (!app) {
      console.error(
        '[Habibah Portfolio] Missing #app element in index.html.'
      );
      return;
    }

    Promise.all([
      load('data/site.json'),
      load('data/projects.json')
    ])
      .then(function (results) {
        S = results[0] || {};

        var projectData = results[1];

        if (Array.isArray(projectData)) {
          P = projectData;
        } else if (
          projectData &&
          Array.isArray(projectData.projects)
        ) {
          P = projectData.projects;
        } else {
          throw new Error(
            'data/projects.json must contain an array ' +
            'or an object with a projects array.'
          );
        }

        if (!S || typeof S !== 'object') {
          throw new Error(
            'data/site.json must contain a valid JSON object.'
          );
        }

        /* FOOTER */

        if (foot) {
          foot.innerHTML = (
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

            '</div>'
          );
        }

        window.removeEventListener('hashchange', route);
        window.addEventListener('hashchange', route);

        route();
      })
      .catch(showLoadError);
  }

  /* ========================================
     WAIT FOR THE HTML TO BE READY
     ======================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
      once: true
    });
  } else {
    init();
  }

})();
