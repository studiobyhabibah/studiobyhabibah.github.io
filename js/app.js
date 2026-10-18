(function () {
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
    return n < 10 ? '0' + n : n;
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
    var sh = [
      '<path d="M90 420V230a110 110 0 0 1 220 0v190z"/>',
      '<circle cx="200" cy="240" r="120"/>',
      '<path d="M80 300c-20-90 60-170 150-150s110 120 60 200-190 60-210-50z"/>',
      '<rect x="90" y="130" width="50" height="290"/><rect x="175" y="190" width="50" height="230"/><rect x="260" y="100" width="50" height="320"/>'
    ][n % 4];

    return '<svg viewBox="0 0 400 500" role="img" aria-label="Placeholder for ' +
      esc(p.title) + '" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="400" height="500" style="fill:var(--' + tones[n % 6] + ')"/>' +
      '<g style="fill:var(--' + acc[(n + 1) % 4] + ')" transform="rotate(' +
      (n * 7 - 6) + ' 200 250)">' + sh + '</g>' +
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

  function items(c) {
    return P.map(function (p, i) {
      return [p, i];
    }).filter(function (x) {
      return !c || c === 'All' || x[0].category === c;
    });
  }

  /* archive drawer */

  function lib(l) {
    if (!l.length) {
      return '<p class="txt">No projects in this category yet.</p>';
    }

    return '<div class="archive-drawer">' +
      '<div class="archive-files">' +
      l.map(function (x) {
        var p = x[0];
        var i = x[1];

        return '<a class="archive-file" href="#/work/' +
          pid(p, i) + '" aria-label="' + esc(p.title) + '">' +

          '<span class="archive-file-tab">' +
            '<span class="archive-file-title">' +
              esc(p.title) +
            '</span>' +
            '<span class="translation" lang="ar" dir="rtl">' +
              'مَشْرُوع' +
            '</span>' +
          '</span>' +

          '<span class="archive-file-body">' +
            '<span class="archive-file-preview">' +
              art(p, i, 0) +
            '</span>' +

            '<span>' +
              '<span class="archive-file-title">' +
                esc(p.title) +
              '</span>' +
              '<span class="archive-file-meta">' +
                esc(p.category) +
              '</span>' +
            '</span>' +
          '</span>' +

        '</a>';
      }).join('') +
      '</div>' +
    '</div>';
  }

  /* homepage */

  function hero() {
    return '<section class="intro">' +
      '<div class="intro-name">' +
        '<h1 lang="ar" dir="rtl">حَبِيبَه</h1>' +
        '<p class="intro-title">visual creative</p>' +
        '<span class="translation" lang="ar" dir="rtl">' +
          'مُبْدِعَةٌ بَصَرِيَّة' +
        '</span>' +
      '</div>' +
      '<p class="intro-description">' +
        esc(S.intro || S.tagline || '') +
      '</p>' +
    '</section>';
  }

  /* translations */

  function tr(en, ar) {
    return '<span class="nav-label">' + en +
      '<span class="translation" lang="ar" dir="rtl">' +
      ar + '</span></span>';
  }

  function archiveHeading() {
    return '<div class="archive-heading">' +
      '<div><h2>the archive</h2>' +
      '<span class="translation" lang="ar" dir="rtl">' +
      'الأَرْشِيف' + '</span></div>' +
      '<p>a collection of visual experiments and projects</p>' +
      '</div>';
  }

  var views = {
    home: function () {
      return hero() +
        '<section class="archive-section">' +
          archiveHeading() +
          lib(items()) +
          '<p class="archive-more"><a href="#/work">' +
            tr('view all work', 'عَرْضُ كُلِّ الأَعْمَال') +
          '</a></p>' +
        '</section>';
    },

    work: function () {
      return '<section class="archive-section">' +
        archiveHeading() +
        '<div class="filters" role="group" aria-label="Filter by category">' +
          ['All'].concat(S.categories || []).map(function (c) {
            return '<button type="button" aria-pressed="' +
              (c === 'All') + '" data-c="' + esc(c) + '">' +
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
      var l = [
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
        '<div><h1>contact</h1>' +
        '<span class="translation" lang="ar" dir="rtl">' +
          'تَوَاصُل' +
        '</span></div>' +
        l.join('') +
      '</section>';
    }
  };

  /* project details */

  function project(id) {
    var i = parseInt(id, 10) - 1;
    var p = P[i];

    if (!p) {
      return '<p class="txt">Project not found. ' +
        '<a href="#/work">Back to work</a></p>';
    }

    var n = Math.max((p.images || []).length, 4);
    var sq = '';
    var cl = '';
    var d = String(p.description || '').split(/\n\s*\n/);

    for (var j = 0; j < n; j++) {
      sq += '<figure class="sq" tabindex="0" role="button" ' +
        'aria-label="View image ' + (j + 1) + ' larger">' +
        '<span class="num">' + circ(j + 1) + '</span>' +
        '<div class="art">' + art(p, i, j) + '</div>' +
      '</figure>';

      if (cap(p, j)) {
        cl += '<li><span>' + circ(j + 1) + '</span>' +
          esc(cap(p, j)) + '</li>';
      }
    }

    return '<div class="pj">' +
      '<div class="sqs">' + sq + '</div>' +
      '<aside>' +
        '<a href="#/work">back to work</a>' +
        '<span class="translation" lang="ar" dir="rtl">' +
          'العَوْدَةُ إِلَى الأَعْمَال' +
        '</span>' +
        '<h1>' + esc(p.title) + '</h1>' +
        '<hr>' +
        '<p class="it">' + esc(d[0]) + '</p>' +
        (cl ? '<ul class="cl">' + cl + '</ul>' : '') +
        '<h3>details</h3>' +
        '<span class="translation" lang="ar" dir="rtl">' +
          'التَّفَاصِيل' +
        '</span>' +
        '<p class="meta">' + esc(p.category) +
          (p.year ? ', ' + esc(p.year) : '') +
        '</p>' +
        paras(d.slice(1).join('\n\n')) +
        (p.role
          ? '<h3>my role</h3>' +
            '<span class="translation" lang="ar" dir="rtl">' +
              'دَوْرِي' +
            '</span><p>' + esc(p.role) + '</p>'
          : '') +
        (p.process
          ? '<h3>process</h3>' +
            '<span class="translation" lang="ar" dir="rtl">' +
              'مَرَاحِلُ العَمَل' +
            '</span>' + paras(p.process)
          : '') +
      '</aside>' +
    '</div>';
  }

  /* navigation */

  function route() {
    var h = location.hash.replace(/^#\/?/, '').split('/');
    var v = h[0] || 'home';

    if (['home', 'work', 'about', 'contact'].indexOf(v) < 0) {
      v = 'home';
    }

    app.innerHTML = (v === 'work' && h[1])
      ? project(h[1])
      : views[v]();

    document.title = (
      v === 'home' ? '' : v + ' | '
    ) + 'Habibah';

    window.scrollTo(0, 0);

    [].forEach.call(document.querySelectorAll('nav a'), function (a) {
      if (a.getAttribute('href') === '#/' + v) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  /* image viewer */

  function open(el) {
    var artwork = el.querySelector('.art');

    if (!artwork) return;

    lbc.innerHTML = artwork.innerHTML;
    lb.showModal();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-c]');
    var a = e.target.closest('.sq');

    if (b) {
      [].forEach.call(b.parentNode.children, function (x) {
        x.setAttribute('aria-pressed', x === b);
      });

      document.getElementById('g').innerHTML = lib(items(b.dataset.c));
    } else if (a) {
      open(a);
    } else if (e.target.id === 'lbx' || e.target === lb) {
      lb.close();
    }
  });

  document.addEventListener('keydown', function (e) {
    var a = e.target.closest && e.target.closest('.sq');

    if (a && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      open(a);
    }
  });

  /* load portfolio data */

  function load(u) {
    return fetch(u, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + u);
      return r.json();
    });
  }

  Promise.all([
    load('data/site.json'),
    load('data/projects.json')
  ]).then(function (r) {
    S = r[0];
    P = r[1].projects || [];

    foot.innerHTML =
      '<div class="mos">' +
        '<h2>end of the archive</h2>' +
        '<span class="translation" lang="ar" dir="rtl">' +
          'نِهَايَةُ الأَرْشِيف' +
        '</span>' +
      '</div>' +

      '<div class="bar">' +
        '<div class="big">habibah</div>' +
        '<a href="#/">' + tr('home', 'الرَّئِيسِيَّة') + '</a>' +
        '<a href="#/work">' + tr('work', 'الأَعْمَال') + '</a>' +
        '<a href="#/about">' + tr('about', 'مَنْ أَنَا') + '</a>' +
        '<a href="#/contact">' + tr('contact', 'تَوَاصُل') + '</a>' +
      '</div>';

    window.addEventListener('hashchange', route);
    route();
  }).catch(function () {
    app.innerHTML =
      '<p class="txt">The portfolio data could not load. ' +
      'Please open the published website and try again.</p>';
  });
})();
