const $ = s => document.querySelector(s);
const REPO_URL = 'https://github.com/adamstark1/Vice-Companion';
const CATS = {
  'easter-eggs': { label: 'Easter Eggs', color: '#ff4fa3' },
  outfits:       { label: 'Outfits',     color: '#19e3d1' },
  vehicles:      { label: 'Vehicles',    color: '#ff9a3d' }
};
const PAGE_TITLES = {
  'easter-eggs': 'Easter Eggs',
  outfits: 'Outfits',
  vehicles: 'Vehicles',
  map: 'Map'
};
const SUBMIT_TYPES = {
  home: 'unspecified',
  'easter-eggs': 'easter egg',
  outfits: 'outfit',
  vehicles: 'vehicle',
  map: 'map location'
};
const PAGES = ['home', 'easter-eggs', 'outfits', 'vehicles', 'map'];
const MAP_W = 1500, MAP_H = 2000;
const PAGE_SIZE = 10;
const data = {}, layers = {}, markers = {};
const state = { letter: '', q: '', limit: PAGE_SIZE };
let map, focusLayer, revealObserver;

const AVATARS = {
  xgarbett: 'https://pbs.twimg.com/profile_images/1450888241033453581/m8C8Y9_J_normal.jpg',
  ign: 'https://pbs.twimg.com/profile_images/2125287135779696640/3wKamwrm_normal.jpg',
  sir_albs: 'https://pbs.twimg.com/profile_images/1879496601145581568/hLn_myJS_normal.jpg',
  ecto_fun: 'https://pbs.twimg.com/profile_images/2122592796200542208/yvYMe8Bq_normal.jpg',
  herdeirakirijo: 'https://pbs.twimg.com/profile_images/2111638759959584768/ZfW71NKk_normal.jpg',
  wastedclipscom: 'https://pbs.twimg.com/profile_images/2124858448848261120/Rsvno_1Z_normal.jpg',
  itsprisey: 'https://pbs.twimg.com/profile_images/1556844463611420674/cGH7oT8o_normal.jpg',
  gatorkeys_: 'https://pbs.twimg.com/profile_images/1937421344070619136/QgOYQTiG_normal.jpg',
  sicklytheninja: 'https://pbs.twimg.com/profile_images/2120342703334621184/3CsFKHzO_normal.jpg',
  whooisaakash: 'https://pbs.twimg.com/profile_images/2115293839498129408/GRwcuAhv_normal.jpg',
  gtabase: 'https://pbs.twimg.com/profile_images/2097353889385271296/GITYglP6_normal.jpg',
  mislead: 'https://pbs.twimg.com/profile_images/2100031901520068608/EcuZNO-m_normal.jpg',
  viztur: 'https://pbs.twimg.com/profile_images/2022219843030986756/WWWa1x0d_normal.jpg',
  chizplays: 'https://pbs.twimg.com/profile_images/1430615012264095752/GVSA8m_z_normal.jpg',
  discussingfilm: 'https://pbs.twimg.com/profile_images/1706429397467549696/hmvwfChQ_normal.jpg',
  asexybiscuit: 'https://pbs.twimg.com/profile_images/2107400400559013888/SwUGJM4G_normal.jpg',
  rileyralmuto: 'https://pbs.twimg.com/profile_images/1756369604002062336/WHMjPgyO_normal.jpg',
  pirat_nation: 'https://pbs.twimg.com/profile_images/1795139938586890240/fQtS5oQr_normal.jpg',
  rcd16_: 'https://pbs.twimg.com/profile_images/2123236577795080192/gNfPK1FI_normal.jpg',
  dogmanx31: 'https://pbs.twimg.com/profile_images/2122447663689805824/cZ7YFJzx_normal.jpg',
  realradec: 'https://pbs.twimg.com/profile_images/1661418446733574165/95jT4FpI_normal.jpg',
  gameroll_: 'https://pbs.twimg.com/profile_images/2105047821023875072/6mw8WRUN_normal.jpg',
  brewski77: 'https://pbs.twimg.com/profile_images/1904724320900816896/Vd-WQm5k_normal.jpg',
  dexerto: 'https://pbs.twimg.com/profile_images/1714301666445402112/5U5myYFv_normal.jpg',
  detonatedcom: 'https://pbs.twimg.com/profile_images/1647272180885987328/B9DwTwNq_normal.png',
  wilh_flashito: 'https://pbs.twimg.com/profile_images/2116558213210394624/Pf2ro8d1_normal.jpg',
  chumbucketdrama: 'https://pbs.twimg.com/profile_images/2107276649469501440/YZjIjAyg_normal.jpg',
  pilasto1: 'https://pbs.twimg.com/profile_images/2096651530497634307/A895oknL_normal.jpg',
  snowembrace: 'https://pbs.twimg.com/profile_images/1619997946681901056/fGakcfUg_normal.jpg',
  culturecrave: 'https://pbs.twimg.com/profile_images/1852343670455918593/s4KQ-54f_normal.jpg',
  memeioyt: 'https://pbs.twimg.com/profile_images/1952330685114707968/lmX4sgMI_normal.jpg',
  paramountgames: 'https://pbs.twimg.com/profile_images/2062903238836494336/afsAEJWN_normal.jpg',
  gtalphaintel: 'https://pbs.twimg.com/profile_images/2113647990380404736/qNDk_P8D_normal.jpg'
};
const pendingAvatars = {};

try {
  Object.assign(AVATARS, JSON.parse(localStorage.getItem('vc_avatars') || '{}'));
} catch {}

function saveAvatar(key, url) {
  AVATARS[key] = url;
  try { localStorage.setItem('vc_avatars', JSON.stringify(AVATARS)); } catch {}
  document.querySelectorAll(`img[data-av-handle="${key}"]`).forEach(img => {
    img.src = url;
  });
}

function resolveAvatar(h, tweetId = '') {
  if (!h) return;
  const key = h.toLowerCase();
  if (AVATARS[key] || pendingAvatars[key]) return;
  const endpoint = tweetId
    ? `https://api.fxtwitter.com/${h}/status/${tweetId}`
    : `https://api.fxtwitter.com/${h}`;
  pendingAvatars[key] = fetch(endpoint)
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      const url = d?.tweet?.author?.avatar_url || d?.user?.avatar_url;
      if (url) saveAvatar(key, url);
    })
    .catch(() => {})
    .finally(() => { delete pendingAvatars[key]; });
}

function initMobileMenu() {
  const btn = $('#menu-toggle');
  const nav = $('#main-nav');
  if (!btn || !nav) return;
  const closeMenu = () => {
    btn.classList.remove('open');
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };
  btn.onclick = e => {
    e.stopPropagation();
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  document.addEventListener('click', e => {
    if (!e.target.closest('.bar')) closeMenu();
  });
}
initMobileMenu();

const failed = [];

Promise.all(Object.keys(CATS).map(k =>
  fetch(`data/${k}.json?v=${Date.now()}`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() => { failed.push(k); return []; })
    .then(j => data[k] = j)
)).then(() => {
  ['outfits', 'vehicles'].forEach(k => {
    $('#l-' + k).innerHTML = data[k].map(i => card(k, i)).join('');
  });
  buildAZ();
  renderPosts();
  renderHome();
  if (failed.length) {
    $('#l-easter-eggs').innerHTML = `<p class="empty">Could not load data/${failed.join('.json, data/')}.json. Open the site through a local server (python3 -m http.server) and make sure the data folder sits next to index.html.</p>`;
  }
  route();
});
addEventListener('hashchange', route);

const first = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '')[0].toUpperCase();

function ago(d) {
  const n = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(d + 'T00:00:00')) / 864e5);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 30) return n + ' days ago';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const tags = i => i.tags && i.tags.length ? `<div class="tags">${i.tags.map(t => `<span><i>${t}</i></span>`).join('')}</div>` : '';

const sourceInfo = i => {
  const m = (i.source || i.embed || '').match(/(?:x|twitter)\.com\/([^/]+)\/status\/(\d+)/);
  if (m) return { handle: m[1], tweetId: m[2] };
  const h = (i.author || '').replace(/^@/, '').trim();
  return { handle: h, tweetId: '' };
};

const avatar = (src, fallback, name, key) => {
  const fb = fallback ? `data-fb="${fallback}" onerror="if(this.dataset.fb){this.src=this.dataset.fb;delete this.dataset.fb}else{this.remove()}"` : 'onerror="this.remove()"';
  return `<span class="av">${(name || '?')[0].toUpperCase()}${src ? `<img src="${src}" data-av-handle="${key}" alt="" referrerpolicy="no-referrer" ${fb}>` : ''}</span>`;
};

const meta = i => {
  const { handle: h, tweetId } = sourceInfo(i);
  const key = h.toLowerCase();
  if (h && !i.avatar && !AVATARS[key]) resolveAvatar(h, tweetId);
  const primary = i.avatar || AVATARS[key] || (h ? `https://unavatar.io/x/${h}` : '');
  const fallback = h ? `https://unavatar.io/twitter/${h}` : '';
  const by = i.addedBy ? `<span class="added-by">· added by <b class="by">${i.addedBy}</b></span>` : '';
  return `<div class="meta">${avatar(primary, fallback, i.author, key)}<b>${i.author || 'Unknown'}</b>${i.date ? `<span>· ${ago(i.date)}</span>` : ''}${by}</div>`;
};

function post(i, extraClass = '', delay = 0) {
  const cls = ['post', extraClass].filter(Boolean).join(' ');
  const style = delay ? ` style="--d:${delay}s"` : '';
  return `<a class="${cls}" href="#/easter-eggs/${i.id}"${style}>
    <div class="post-main"><h3>${i.title}</h3><p>${i.description || ''}</p>${tags(i)}${meta(i)}</div>
    ${i.image ? `<img src="${i.image}" alt="" loading="lazy">` : ''}
    <span class="go">→</span></a>`;
}

function getPoints(pos) {
  if (!Array.isArray(pos) || !pos.length) return [];
  if (typeof pos[0] === 'number' && typeof pos[1] === 'number') return [{ coord: pos, label: '' }];
  return pos.map(p => {
    if (Array.isArray(p) && typeof p[0] === 'number') return { coord: [p[0], p[1]], label: p[2] || '' };
    if (p && Array.isArray(p.pos)) return { coord: p.pos, label: p.label || '' };
    return null;
  }).filter(Boolean);
}

function hasPos(i) {
  return getPoints(i.pos).length > 0;
}

function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  }
  document.querySelectorAll('#p-home .reveal:not(.in)').forEach(el => revealObserver.observe(el));
}

function buildAZ() {
  const have = new Set(data['easter-eggs'].map(i => first(i.title)));
  $('#az').innerHTML = '<button data-l="" class="on">All</button>' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => `<button data-l="${l}" ${have.has(l) ? '' : 'disabled'}>${l}</button>`).join('');
  $('#az').onclick = e => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    state.letter = state.letter === b.dataset.l ? '' : b.dataset.l;
    state.limit = PAGE_SIZE;
    document.querySelectorAll('#az button').forEach(x => x.classList.toggle('on', x.dataset.l === state.letter));
    renderPosts();
  };
  $('#q').oninput = e => {
    state.q = e.target.value.trim().toLowerCase().replace(/^#/, '');
    state.limit = PAGE_SIZE;
    renderPosts();
  };
  const moreBtn = $('#more-ee');
  if (moreBtn) {
    moreBtn.onclick = () => {
      state.limit += PAGE_SIZE;
      renderPosts();
    };
  }
}

function renderPosts() {
  const list = data['easter-eggs']
    .filter(i => (!state.letter || first(i.title) === state.letter) &&
      (!state.q || [i.title, i.description, i.author, ...(i.tags || [])].join(' ').toLowerCase().includes(state.q)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const visible = list.slice(0, state.limit);
  $('#count').textContent = `Showing ${visible.length} of ${list.length} ${list.length === 1 ? 'post' : 'posts'}`;
  $('#l-easter-eggs').innerHTML = visible.length ? visible.map(i => post(i)).join('') : '<p class="empty">No easter egg matches your search.</p>';
  const moreBtn = $('#more-ee');
  if (moreBtn) {
    moreBtn.hidden = list.length <= visible.length;
    moreBtn.textContent = 'Show more';
  }
}

function renderHome() {
  const box = $('#home-recent');
  if (!box) return;
  const recentEE = [...(data['easter-eggs'] || [])]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);
  const recentCat = k => [...(data[k] || [])]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);
  const recentVehicles = recentCat('vehicles');
  const recentOutfits = recentCat('outfits');

  const soonCard = k => {
    const c = CATS[k];
    return `<article class="card card-soon reveal" style="--c:${c.color}"><div><span class="tag">${c.label} · Coming Soon</span><h3>Coming Soon</h3><p>New ${c.label.toLowerCase()} locations and unlock guides are being added soon.</p></div></article>`;
  };

  box.innerHTML = `
    <div class="recent-head reveal" style="--c:${CATS['easter-eggs'].color}">
      <h2>Recently Added Easter Eggs</h2>
      <a href="#/easter-eggs">All Easter Eggs →</a>
    </div>
    <div class="posts recent-posts">${recentEE.map((i, idx) => post(i, 'reveal', idx * 0.08)).join('')}</div>

    <div class="recent-head reveal" style="--c:${CATS.vehicles.color}">
      <h2>Recently Added Vehicles</h2>
      <a href="#/vehicles">All Vehicles →</a>
    </div>
    <div class="grid">${recentVehicles.length ? recentVehicles.map((i, idx) => card('vehicles', i, 'reveal', idx * 0.08)).join('') : soonCard('vehicles')}</div>

    <div class="recent-head reveal" style="--c:${CATS.outfits.color}">
      <h2>Recently Added Outfits</h2>
      <a href="#/outfits">All Outfits →</a>
    </div>
    <div class="grid">${recentOutfits.length ? recentOutfits.map((i, idx) => card('outfits', i, 'reveal', idx * 0.08)).join('') : soonCard('outfits')}</div>
  `;
  initScrollAnimations();
}

function embed(u) {
  const m = (u || '').match(/(?:x|twitter)\.com\/([^/]+)\/status\/(\d+)/);
  if (!m) return '';
  const href = `https://x.com/${m[1]}/status/${m[2]}?ref_src=twsrc%5Etfw`;
  return `<div class="embed"><blockquote class="twitter-video" data-status="hidden" data-theme="dark" data-dnt="true"><a href="${href}">Watch the video on X ↗</a></blockquote></div>`;
}

function loadTweets() {
  if (window.twttr && twttr.widgets) { twttr.widgets.load($('#ee-thread')); return; }
  if (document.getElementById('x-widgets')) return;
  const s = document.createElement('script');
  s.id = 'x-widgets';
  s.async = true;
  s.src = 'https://platform.x.com/widgets.js';
  s.onload = () => twttr.widgets.load($('#ee-thread'));
  document.body.appendChild(s);
}

function showThread(id) {
  const i = data['easter-eggs'].find(x => x.id === id);
  $('#ee-list').hidden = !!i;
  $('#ee-thread').hidden = !i;
  if (!i) return;
  const paras = (Array.isArray(i.content) ? i.content : [i.description || '']).map(p => `<p>${p}</p>`).join('');
  const pts = getPoints(i.pos);
  $('#ee-thread').innerHTML = `<a class="back" href="#/easter-eggs">← All Easter Eggs</a>
    <h2>${i.title}</h2>${tags(i)}${meta(i)}
    ${i.image ? `<img class="hero-img" src="${i.image}" alt="${i.title}">` : ''}
    <div class="body">${paras}</div>
    ${embed(i.embed)}
    <div class="acts-row">
      ${i.source ? `<a class="btn" href="${i.source}" target="_blank" rel="noopener noreferrer">Original post ↗</a>` : ''}
      ${pts.length ? `<a class="btn" href="#/map/easter-eggs:${i.id}">Show on map</a>` : ''}
      <a class="btn star-btn" href="${REPO_URL}" target="_blank" rel="noopener noreferrer">★ Star Repo</a>
    </div>`;
  if (i.embed) loadTweets();
}

function updateSubmitLink(page) {
  const btn = $('#submit-link');
  if (!btn) return;
  const type = SUBMIT_TYPES[page] || 'unspecified';
  const title = `[submit: ${type}] Title here`;
  const body = [
    `### Category`,
    type,
    ``,
    `### Title`,
    `Enter the name of the ${type === 'unspecified' ? 'discovery (Easter Egg / Outfit / Vehicle)' : type}`,
    ``,
    `### Short Description`,
    `1-2 sentence summary shown on the card`,
    ``,
    `### Full Guide / Content`,
    `Detailed steps, location in Leonida, and any rewards (Weapon, Clothing, Money, Boost)`,
    ``,
    `### Source / Video Link (X / Twitter)`,
    `https://x.com/...`,
    ``,
    `### Map Coordinates or In-Game Area (Optional)`,
    `e.g. Key Lento, Vice Beach, Port Gellhorn or [x, y]`,
    ``,
    `### Your Name / Handle (Added By)`,
    ``
  ].join('\n');
  btn.href = `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function card(k, i, extraClass = '', delay = 0) {
  const c = CATS[k];
  const cls = ['card', extraClass].filter(Boolean).join(' ');
  const style = `--c:${c.color}${delay ? `;--d:${delay}s` : ''}`;
  return `<article class="${cls}" style="${style}">
    ${i.image ? `<img src="${i.image}" alt="${i.title}" loading="lazy">` : ''}
    <div><span class="tag">${c.label}</span><h3>${i.title}</h3><p>${i.description || ''}</p>
    ${hasPos(i) ? `<a class="loc" href="#/map/${k}:${i.id}">Show on map →</a>` : ''}</div></article>`;
}

function route() {
  const [p, arg] = location.hash.slice(2).split('/');
  const page = PAGES.includes(p) ? p : 'home';
  document.querySelectorAll('.page').forEach(s => {
    const active = s.id === 'p-' + page;
    if (active && s.hidden) {
      s.style.animation = 'none';
      s.offsetHeight;
      s.style.animation = '';
    }
    s.hidden = !active;
  });
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.p === page));
  const btn = $('#menu-toggle'), nav = $('#main-nav');
  if (btn && nav) { btn.classList.remove('open'); nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  document.title = PAGE_TITLES[page] ? `${PAGE_TITLES[page]} | Vice Companion` : 'Vice Companion';
  updateSubmitLink(page);
  if (page === 'home') initScrollAnimations();
  if (page === 'easter-eggs') showThread(arg);
  if (page === 'map') initMap(arg); else scrollTo(0, 0);
}

function setDefaultMapView() {
  map.setView([MAP_H - 1100, 900], 0);
}

function initMap(focus) {
  if (!map) {
    map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 3,
      zoomSnap: .5,
      zoomDelta: .5,
      wheelPxPerZoomLevel: 100,
      preferCanvas: true,
      attributionControl: false
    });
    const bounds = [[0, 0], [MAP_H, MAP_W]];
    L.imageOverlay('assets/map.svg', bounds).addTo(map);
    map.setMaxBounds([[-200, -200], [MAP_H + 200, MAP_W + 200]]);
    focusLayer = L.layerGroup().addTo(map);
    Object.entries(CATS).forEach(([k, c]) => {
      const catMarkers = [];
      data[k].filter(hasPos).forEach(i => {
        const link = k === 'easter-eggs' ? `#/${k}/${i.id}` : `#/${k}`;
        const pts = getPoints(i.pos);
        const itemMarkers = pts.map((pt, idx) => {
          const stepTitle = pt.label ? `<b>${i.title}</b><br><em>${pt.label}</em>` : (pts.length > 1 ? `<b>${i.title} (#${idx + 1}/${pts.length})</b>` : `<b>${i.title}</b>`);
          const m = L.marker([MAP_H - pt.coord[1], pt.coord[0]], {
            icon: L.divIcon({ className: 'pin', html: `<i style="background:${c.color}"></i>`, iconSize: [18, 18] })
          }).bindPopup(`${stepTitle}<br>${i.description || ''}<br><a href="${link}">Open ${c.label}</a>`);
          catMarkers.push(m);
          return m;
        });
        markers[`${k}:${i.id}`] = itemMarkers;
      });
      layers[k] = L.layerGroup(catMarkers).addTo(map);
    });
    $('#filters').innerHTML = Object.entries(CATS).map(([k, c]) =>
      `<button class="on" data-k="${k}" style="--c:${c.color}">${c.label}</button>`).join('') +
      `<button class="show-all-pins" id="show-all-pins" hidden>Show all pins</button>`;
    $('#filters').onclick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'show-all-pins') {
        location.hash = '#/map';
        return;
      }
      if (focusLayer) {
        focusLayer.clearLayers();
        const showAllBtn = $('#show-all-pins');
        if (showAllBtn) showAllBtn.hidden = true;
      }
      map[b.classList.toggle('on') ? 'addLayer' : 'removeLayer'](layers[b.dataset.k]);
    };
    setDefaultMapView();
  }
  map.invalidateSize();
  const showAllBtn = $('#show-all-pins');
  focusLayer.clearLayers();

  if (focus && markers[focus] && markers[focus].length) {
    Object.keys(CATS).forEach(k => {
      if (map.hasLayer(layers[k])) map.removeLayer(layers[k]);
      const btn = $(`#filters button[data-k="${k}"]`);
      if (btn) btn.classList.remove('on');
    });
    if (showAllBtn) showAllBtn.hidden = false;

    const ms = markers[focus];
    ms.forEach(m => focusLayer.addLayer(m));

    if (ms.length === 1) {
      map.setView(ms[0].getLatLng(), 1);
      ms[0].openPopup();
    } else {
      const groupBounds = L.latLngBounds(ms.map(m => m.getLatLng()));
      map.fitBounds(groupBounds, { padding: [50, 50], maxZoom: 1 });
      ms[0].openPopup();
    }
  } else {
    if (showAllBtn) showAllBtn.hidden = true;
    Object.keys(CATS).forEach(k => {
      if (!map.hasLayer(layers[k])) map.addLayer(layers[k]);
      const btn = $(`#filters button[data-k="${k}"]`);
      if (btn) btn.classList.add('on');
    });
    setDefaultMapView();
  }
}
