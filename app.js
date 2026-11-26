const $ = s => document.querySelector(s);
const REPO_URL = 'https://github.com/adamstark1/Vice-Companion';
const FOUND_COLOR = '#25f49a';
const FOUND_KEY = 'vc_found';
const VALID_ID_RE = /^[a-z0-9-]{1,64}$/;
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCov1sMWSgNxd2fFNo_EydOk-9wrPKhvow',
  authDomain: 'vice-companion-eb235.firebaseapp.com',
  projectId: 'vice-companion-eb235',
  appId: '1:475500922455:web:6ebcf16962d0e462818512'
};
const CATS = {
  'easter-eggs': { label: 'Easter Eggs', color: '#ff4fa3' },
  outfits:       { label: 'Outfits',     color: '#19e3d1' },
  vehicles:      { label: 'Vehicles',    color: '#ff9a3d' }
};
const PAGE_TITLES = {
  'easter-eggs': 'Easter Eggs',
  outfits: 'Outfits',
  vehicles: 'Vehicles',
  map: 'Map',
  profile: 'Profile'
};
const SUBMIT_TYPES = {
  home: 'unspecified',
  'easter-eggs': 'easter egg',
  outfits: 'outfit',
  vehicles: 'vehicle',
  map: 'map location',
  profile: 'unspecified'
};
const PAGES = ['home', 'easter-eggs', 'outfits', 'vehicles', 'map', 'profile'];
const MAP_TILE_URL = 'https://cdn.jsdelivr.net/gh/rolux/gtadb.org@main/maps/tiles/6/day/{z}/{z},{y},{x}.jpg';
const MAP_RANGES = {
  0: [[0, 0], [2, 3]],
  1: [[1, 1], [5, 6]],
  2: [[2, 2], [10, 12]],
  3: [[4, 4], [20, 25]],
  4: [[8, 8], [41, 51]],
  5: [[17, 17], [83, 103]],
  6: [[34, 34], [167, 206]]
};
const PAGE_SIZE = 10;
const data = {}, layers = {}, markers = {}, overviewMarkers = {};
const state = { letter: '', q: '', limit: PAGE_SIZE };
let map, focusLayer, revealObserver;
let fbAuth = null, fbDb = null, currentUser = null, authMsg = '';
const foundSet = loadFoundSet();

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
  gtalphaintel: 'https://pbs.twimg.com/profile_images/2113647990380404736/qNDk_P8D_normal.jpg',
  gta6newshub: 'https://pbs.twimg.com/profile_images/2069761723142123520/Gr9qZgEw_normal.jpg',
  caspahz: 'https://pbs.twimg.com/profile_images/2124135317158707200/A3OE9M38_normal.jpg',
  pi5cesmoon: 'https://pbs.twimg.com/profile_images/2125695690781143040/uOsn9xcK_normal.jpg'
};
const pendingAvatars = {};

try {
  Object.assign(AVATARS, JSON.parse(localStorage.getItem('vc_avatars') || '{}'));
} catch {}

function sanitizeIds(arr) {
  if (!Array.isArray(arr)) return [];
  const validKnown = data['easter-eggs'] ? new Set(data['easter-eggs'].map(i => i.id)) : null;
  return arr
    .filter(x => typeof x === 'string' && VALID_ID_RE.test(x) && (!validKnown || validKnown.has(x)))
    .slice(0, 200);
}

function readCookieFound() {
  try {
    const row = document.cookie.split('; ').find(r => r.startsWith(FOUND_KEY + '='));
    if (!row) return [];
    return sanitizeIds(JSON.parse(decodeURIComponent(row.split('=').slice(1).join('='))));
  } catch {
    return [];
  }
}

function readLocalFound() {
  try {
    return sanitizeIds(JSON.parse(localStorage.getItem(FOUND_KEY) || '[]'));
  } catch {
    return [];
  }
}

function loadFoundSet() {
  return new Set([...readLocalFound(), ...readCookieFound()]);
}

function saveLocalFound() {
  const arr = sanitizeIds([...foundSet]);
  const raw = JSON.stringify(arr);
  try { localStorage.setItem(FOUND_KEY, raw); } catch {}
  try {
    document.cookie = `${FOUND_KEY}=${encodeURIComponent(raw)};path=/;max-age=31536000;SameSite=Lax`;
  } catch {}
}

function isFirebaseConfigured() {
  return Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId && window.firebase);
}

function syncCloudFound() {
  if (!fbDb || !currentUser) return Promise.resolve();
  const cleanFound = sanitizeIds([...foundSet]);
  return fbDb.collection('users').doc(currentUser.uid).set({
    found: cleanFound,
    updatedAt: Date.now()
  }).catch(() => {});
}

function updateNavProfile() {
  const link = $('#nav-profile');
  if (!link) return;
  if (currentUser) {
    const firstWord = (currentUser.displayName || 'Profile').split(' ')[0];
    const pic = currentUser.photoURL ? `<img class="nav-av" src="${currentUser.photoURL}" alt="" referrerpolicy="no-referrer">` : '';
    link.innerHTML = `${pic}<span>${firstWord}</span>`;
  } else {
    link.textContent = 'Profile';
  }
}

function refreshFoundUI() {
  saveLocalFound();
  if (data['easter-eggs']) {
    renderPosts();
    renderHome();
    updateMapPins();
    renderProfile();
  }
}

function toggleFound(id, isChecked) {
  if (!VALID_ID_RE.test(id)) return;
  if (isChecked) foundSet.add(id);
  else foundSet.delete(id);
  refreshFoundUI();
  syncCloudFound();
}

function initFirebase() {
  if (!isFirebaseConfigured()) return;
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    fbAuth = firebase.auth();
    fbDb = firebase.firestore();
    fbDb.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    fbAuth.onAuthStateChanged(async user => {
      currentUser = user || null;
      authMsg = '';
      updateNavProfile();
      if (currentUser && fbDb) {
        try {
          const snap = await fbDb.collection('users').doc(currentUser.uid).get();
          const cloudList = snap.exists && Array.isArray(snap.data()?.found) ? sanitizeIds(snap.data().found) : [];
          let addedFromLocal = false;
          const cloudSet = new Set(cloudList);
          foundSet.forEach(id => {
            if (!cloudSet.has(id)) addedFromLocal = true;
          });
          cloudSet.forEach(id => foundSet.add(id));
          if (!snap.exists || addedFromLocal) {
            await syncCloudFound();
          }
        } catch {}
      }
      refreshFoundUI();
    });
  } catch {}
}

async function signInWithGoogle() {
  if (!isFirebaseConfigured() || !fbAuth) {
    authMsg = 'Firebase config is not filled in yet. Add your Firebase project keys to FIREBASE_CONFIG in app.js.';
    renderProfile();
    return;
  }
  try {
    authMsg = '';
    const provider = new firebase.auth.GoogleAuthProvider();
    await fbAuth.signInWithPopup(provider);
  } catch (err) {
    authMsg = err?.message || 'Could not complete Google Sign-In.';
    renderProfile();
  }
}

async function signOutUser() {
  if (!fbAuth) return;
  try {
    await fbAuth.signOut();
  } catch {}
}

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
initFirebase();

const failed = [];

Promise.all(Object.keys(CATS).map(k =>
  fetch(`data/${k}.json?v=${Date.now()}`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() => { failed.push(k); return []; })
    .then(j => data[k] = j)
)).then(() => {
  const validIds = sanitizeIds([...foundSet]);
  foundSet.clear();
  validIds.forEach(id => foundSet.add(id));
  saveLocalFound();
  ['outfits', 'vehicles'].forEach(k => {
    $('#l-' + k).innerHTML = data[k].map(i => card(k, i)).join('');
  });
  buildAZ();
  renderPosts();
  renderHome();
  renderProfile();
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

const tags = i => {
  const isFound = i.id && foundSet.has(i.id);
  const list = [
    ...(isFound ? ['<span class="tag-found"><i>Found</i></span>'] : []),
    ...(i.tags || []).map(t => `<span><i>${t}</i></span>`)
  ];
  return list.length ? `<div class="tags">${list.join('')}</div>` : '';
};

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
  const isFound = foundSet.has(i.id);
  const cls = ['post', isFound ? 'is-found' : '', extraClass].filter(Boolean).join(' ');
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
  const allEE = data['easter-eggs'] || [];
  const list = allEE
    .filter(i => (!state.letter || first(i.title) === state.letter) &&
      (!state.q || [i.title, i.description, i.author, ...(i.tags || [])].join(' ').toLowerCase().includes(state.q)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const visible = list.slice(0, state.limit);
  const foundTotal = allEE.filter(i => foundSet.has(i.id)).length;
  $('#count').textContent = `Showing ${visible.length} of ${list.length} ${list.length === 1 ? 'post' : 'posts'} · ${foundTotal} / ${allEE.length} found`;
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

function renderProfile() {
  const box = $('#profile-box');
  if (!box) return;
  const allEE = data['easter-eggs'] || [];
  const foundItems = allEE.filter(i => foundSet.has(i.id));
  const totalEE = allEE.length;
  const foundCount = foundItems.length;
  const pct = totalEE ? Math.round((foundCount / totalEE) * 100) : 0;
  const remaining = Math.max(0, totalEE - foundCount);
  const mappedTotal = allEE.filter(hasPos).length;
  const mappedFound = foundItems.filter(hasPos).length;

  const userHtml = currentUser
    ? `<div class="prof-card synced">
        <div class="prof-user">
          ${currentUser.photoURL ? `<img class="prof-av" src="${currentUser.photoURL}" alt="" referrerpolicy="no-referrer">` : `<div class="prof-av">${(currentUser.displayName || 'U')[0]}</div>`}
          <div class="prof-info">
            <h3>${currentUser.displayName || 'Leonida Explorer'}</h3>
            <p>ID: ${currentUser.uid}</p>
          </div>
        </div>
        <button class="btn" id="auth-out-btn" type="button">Sign Out</button>
      </div>`
    : `<div class="prof-card">
        <div class="prof-user">
          <div class="prof-av">VC</div>
          <div class="prof-info">
            <h3>Guest Explorer</h3>
            <p>Your progress is saved locally. Sign in with Google to sync across devices.</p>
            ${authMsg ? `<p class="prof-msg">${authMsg}</p>` : ''}
          </div>
        </div>
        <button class="google-btn" id="auth-in-btn" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/><path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.3 0 10.6 0 12s.6 3.7 1.6 5.6l3.7-2.8z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 19.9 7.4 23 12 23z"/></svg>
          Sign in with Google
        </button>
      </div>`;

  box.innerHTML = `
    <h2>Profile</h2>
    ${userHtml}
    <div class="stats-grid">
      <div class="stat-box"><span class="stat-label">Easter Eggs Found</span><span class="stat-num green">${foundCount} / ${totalEE}</span></div>
      <div class="stat-box"><span class="stat-label">Completion Rate</span><span class="stat-num">${pct}%</span></div>
      <div class="stat-box"><span class="stat-label">Remaining to Find</span><span class="stat-num">${remaining}</span></div>
      <div class="stat-box"><span class="stat-label">Mapped Pins Found</span><span class="stat-num">${mappedFound} / ${mappedTotal}</span></div>
    </div>
    <div class="prog-wrap">
      <div class="prog-head"><span>Progress</span><span>${foundCount} / ${totalEE} (${pct}%)</span></div>
      <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="recent-head" style="--c:${FOUND_COLOR}">
      <h2>Found Easter Eggs (${foundCount})</h2>
      <a href="#/easter-eggs">All Easter Eggs →</a>
    </div>
    ${foundItems.length ? `<div class="posts recent-posts">${foundItems.map(i => post(i)).join('')}</div>` : '<p class="empty">You have not marked any Easter Eggs as found yet. Open any Easter Egg and check "Mark as Found" to track your progress.</p>'}
  `;

  const inBtn = $('#auth-in-btn');
  if (inBtn) inBtn.onclick = signInWithGoogle;
  const outBtn = $('#auth-out-btn');
  if (outBtn) outBtn.onclick = signOutUser;
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
  const isFound = foundSet.has(i.id);
  const mapBtnLabel = pts.length > 1 ? `Show ${pts.length} locations on map` : 'Show on map';
  $('#ee-thread').innerHTML = `<a class="back" href="#/easter-eggs">← All Easter Eggs</a>
    <h2>${i.title}</h2><div id="thread-tags">${tags(i)}</div>${meta(i)}
    ${i.image ? `<img class="hero-img" src="${i.image}" alt="${i.title}">` : ''}
    <div class="body">${paras}</div>
    ${embed(i.embed)}
    <div class="acts-row">
      <label class="btn found-toggle ${isFound ? 'on' : ''}" id="found-label">
        <input type="checkbox" id="found-cb" ${isFound ? 'checked' : ''}>
        <span class="found-box">✓</span>
        <span class="found-text" id="found-text">${isFound ? 'Found' : 'Mark as Found'}</span>
      </label>
      ${i.source ? `<a class="btn" href="${i.source}" target="_blank" rel="noopener noreferrer">Original post ↗</a>` : ''}
      ${pts.length ? `<a class="btn" href="#/map/easter-eggs:${i.id}">${mapBtnLabel}</a>` : ''}
      <a class="btn star-btn" href="${REPO_URL}" target="_blank" rel="noopener noreferrer">★ Star Repo</a>
    </div>`;
  const cb = $('#found-cb');
  if (cb) {
    cb.onchange = () => {
      const checked = cb.checked;
      const lbl = $('#found-label');
      const txt = $('#found-text');
      if (lbl) lbl.classList.toggle('on', checked);
      if (txt) txt.textContent = checked ? 'Found' : 'Mark as Found';
      toggleFound(i.id, checked);
      const tBox = $('#thread-tags');
      if (tBox) tBox.innerHTML = tags(i);
    };
  }
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
  const pts = getPoints(i.pos);
  const locText = pts.length > 1 ? `Show ${pts.length} locations on map →` : 'Show on map →';
  return `<article class="${cls}" style="${style}">
    ${i.image ? `<img src="${i.image}" alt="${i.title}" loading="lazy">` : ''}
    <div><span class="tag">${c.label}</span><h3>${i.title}</h3><p>${i.description || ''}</p>
    ${pts.length ? `<a class="loc" href="#/map/${k}:${i.id}">${locText}</a>` : ''}</div></article>`;
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
  if (page === 'profile') renderProfile();
  if (page === 'map') initMap(arg); else scrollTo(0, 0);
}

function setDefaultMapView() {
  map.setView([-500, -2500], 1, { animate: false });
}

function buildPinIcon(k, id, stepNum = 0) {
  const isFound = k === 'easter-eggs' && foundSet.has(id);
  const color = isFound ? FOUND_COLOR : CATS[k].color;
  const cls = isFound ? 'pin pin-found' : 'pin';
  const numBadge = stepNum > 0 ? `<b class="pin-num" style="--c:${color}">${stepNum}</b>` : '';
  return L.divIcon({
    className: cls,
    html: `<i style="background:${color}"></i>${numBadge}`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -11]
  });
}

function buildPinPopup(k, i, pt, idx, totalPts, isOverview = false) {
  const c = CATS[k];
  const link = k === 'easter-eggs' ? `#/${k}/${i.id}` : `#/${k}`;
  const isFound = k === 'easter-eggs' && foundSet.has(i.id);
  const accent = isFound ? FOUND_COLOR : c.color;
  const foundTag = isFound ? '<span class="pop-tag pop-tag-found"><i>Found</i></span>' : '';
  const locLabel = totalPts > 1
    ? (isOverview ? `${totalPts} Locations · Start (#1)` : `Location ${idx + 1} / ${totalPts}`)
    : c.label;
  const catTag = `<span class="pop-tag"><i>${locLabel}</i></span>`;
  const stepNote = pt.label ? `<div class="pop-step">${pt.label}</div>` : '';
  return `<div class="pop-card" style="--c:${accent}">
    <div class="pop-tags">${foundTag}${catTag}</div>
    <h4 class="pop-title">${i.title}</h4>
    ${stepNote}
    ${i.description ? `<p class="pop-desc">${i.description}</p>` : ''}
    <a class="pop-btn" href="${link}">Open ${c.label} →</a>
  </div>`;
}

function updateMapPins() {
  if (!map || !data['easter-eggs']) return;
  data['easter-eggs'].filter(hasPos).forEach(i => {
    const key = `easter-eggs:${i.id}`;
    const pts = getPoints(i.pos);
    const ov = overviewMarkers[key];
    if (ov && pts[0]) {
      ov.setIcon(buildPinIcon('easter-eggs', i.id, 0));
      ov.setPopupContent(buildPinPopup('easter-eggs', i, pts[0], 0, pts.length, true));
    }
    const itemMarkers = markers[key];
    if (!itemMarkers) return;
    itemMarkers.forEach((m, idx) => {
      m.setIcon(buildPinIcon('easter-eggs', i.id, pts.length > 1 ? idx + 1 : 0));
      if (pts[idx]) m.setPopupContent(buildPinPopup('easter-eggs', i, pts[idx], idx, pts.length, false));
    });
  });
}

function createLeonidaTileLayer() {
  const LeonidaTiles = L.TileLayer.extend({
    getTileUrl(coords) {
      const tz = coords.z + 1;
      return L.Util.template(this._url, { z: tz, x: coords.x, y: coords.y });
    },
    createTile(coords, done) {
      const tz = coords.z + 1;
      const range = MAP_RANGES[tz];
      if (!range || coords.x < range[0][0] || coords.x > range[1][0] || coords.y < range[0][1] || coords.y > range[1][1]) {
        const empty = document.createElement('div');
        empty.className = 'leaflet-tile';
        setTimeout(() => done(null, empty), 0);
        return empty;
      }
      return L.TileLayer.prototype.createTile.call(this, coords, done);
    }
  });

  return new LeonidaTiles(MAP_TILE_URL, {
    tileSize: 128,
    minZoom: 0,
    maxZoom: 6,
    maxNativeZoom: 5,
    noWrap: true,
    keepBuffer: 2,
    updateWhenZooming: false
  });
}

function initMap(focus) {
  const popupOpts = { autoPanPaddingTopLeft: [24, 24], autoPanPaddingBottomRight: [24, 24] };
  if (!map) {
    const leonidaCRS = L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(1 / 32, 512, -1 / 32, 512)
    });
    map = L.map('map', {
      crs: leonidaCRS,
      minZoom: 0,
      maxZoom: 6,
      zoomSnap: 1,
      zoomDelta: 1,
      wheelPxPerZoomLevel: 100,
      preferCanvas: true,
      attributionControl: false
    });
    createLeonidaTileLayer().addTo(map);
    map.setMaxBounds([[-22000, -22000], [24000, 18000]]);
    focusLayer = L.layerGroup().addTo(map);
    map.on('click', e => {
      if (!e.originalEvent || !e.originalEvent.shiftKey) return;
      const x = Math.round(e.latlng.lng);
      const y = Math.round(e.latlng.lat);
      const coordText = `[${x}, ${y}]`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(coordText).catch(() => {});
      }
      L.popup(popupOpts)
        .setLatLng(e.latlng)
        .setContent(`<div class="pop-card" style="--c:${FOUND_COLOR}"><div class="pop-tags"><span class="pop-tag pop-tag-found"><i>Copied to clipboard</i></span></div><h4 class="pop-title">${coordText}</h4></div>`)
        .openOn(map);
    });
    Object.entries(CATS).forEach(([k, c]) => {
      const catMarkers = [];
      data[k].filter(hasPos).forEach(i => {
        const key = `${k}:${i.id}`;
        const pts = getPoints(i.pos);
        const startPt = pts[0];
        const ovMarker = L.marker([startPt.coord[1], startPt.coord[0]], {
          icon: buildPinIcon(k, i.id, 0)
        }).bindPopup(buildPinPopup(k, i, startPt, 0, pts.length, true), popupOpts);
        overviewMarkers[key] = ovMarker;
        catMarkers.push(ovMarker);

        const itemMarkers = pts.map((pt, idx) =>
          L.marker([pt.coord[1], pt.coord[0]], {
            icon: buildPinIcon(k, i.id, pts.length > 1 ? idx + 1 : 0)
          }).bindPopup(buildPinPopup(k, i, pt, idx, pts.length, false), popupOpts)
        );
        markers[key] = itemMarkers;
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
  map.closePopup();
  map.invalidateSize({ animate: false });
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
      const targetZoom = 3;
      const ptPx = map.project(ms[0].getLatLng(), targetZoom);
      const centerLatLng = map.unproject([ptPx.x, ptPx.y - 110], targetZoom);
      map.setView(centerLatLng, targetZoom, { animate: false });
    } else {
      const groupBounds = L.latLngBounds(ms.map(m => m.getLatLng()));
      map.fitBounds(groupBounds, {
        paddingTopLeft: [70, 220],
        paddingBottomRight: [70, 70],
        maxZoom: 3,
        animate: false
      });
    }
    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      ms[0].openPopup();
    });
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
