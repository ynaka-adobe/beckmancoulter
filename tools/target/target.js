import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const CLIENT_ID = '9d14e19963fb4f7b96cbf6c26aea9139';
const TENANT = 'acsmarketing';
const IMS_BASE = 'https://ims-na1.adobelogin.com';
const SCOPES = 'openid,AdobeID,read_organizations';
const TOKEN_KEY = 'tag-gen-ims-token';

function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes.buffer);
}

async function generateChallenge(verifier) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64urlEncode(hash);
}

async function startOAuth() {
  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  sessionStorage.setItem('pkce_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: SCOPES,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${IMS_BASE}/ims/authorize/v2?${params}`;
}

async function exchangeCode(code) {
  const verifier = sessionStorage.getItem('pkce_verifier');
  sessionStorage.removeItem('pkce_verifier');

  const resp = await fetch(`${IMS_BASE}/ims/token/v3`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    }),
  });

  const data = await resp.json();
  if (!data.access_token) throw new Error(`Token exchange failed: ${data.error_description ?? data.error}`);
  return data.access_token;
}

async function getToken() {
  const stored = sessionStorage.getItem(TOKEN_KEY);
  if (stored) return stored;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    const token = await exchangeCode(code);
    sessionStorage.setItem(TOKEN_KEY, token);
    window.history.replaceState({}, '', window.location.pathname);
    return token;
  }

  await startOAuth();
  return null;
}

const RUNTIME_URL = 'https://332794-868ceruleanwhale.adobeioruntime.net/api/v1/web/default/target-activities';

async function fetchActivities() {
  const resp = await fetch(RUNTIME_URL);
  if (!resp.ok) throw new Error(`Target API error: ${resp.status}`);
  const { activities } = await resp.json();
  return activities ?? [];
}

async function fetchOffers() {
  const resp = await fetch(`${RUNTIME_URL}?resource=offers`);
  if (!resp.ok) throw new Error(`Offers API error: ${resp.status}`);
  const { offers } = await resp.json();
  return offers ?? [];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showOffersModal(offers, activity) {
  document.querySelector('.offers-modal')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'offers-modal';

  const panel = document.createElement('div');
  panel.className = 'offers-panel';

  const header = document.createElement('div');
  header.className = 'offers-header';
  header.innerHTML = `<h3>Select Offer</h3>`;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'offers-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => overlay.remove());
  header.append(closeBtn);

  const table = document.createElement('table');
  table.className = 'offers-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Type</th>
        <th>Modified</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  let selectedOffer = null;

  // Pre-select offer whose name matches the activity name (case-insensitive)
  const currentName = (activity?.name || '').toLowerCase();

  offers.forEach((o) => {
    const tr = document.createElement('tr');
    tr.className = 'offer-row';
    const isMatch = o.name.toLowerCase() === currentName;
    if (isMatch) {
      tr.classList.add('selected');
      selectedOffer = o;
    }
    tr.innerHTML = `
      <td class="select-cell"><span class="radio"></span></td>
      <td>${o.name}</td>
      <td>${o.type ?? '—'}</td>
      <td>${formatDate(o.modifiedAt)}</td>
    `;
    tr.addEventListener('click', () => {
      tbody.querySelectorAll('.offer-row.selected').forEach((r) => r.classList.remove('selected'));
      tr.classList.add('selected');
      selectedOffer = o;
    });
    tbody.append(tr);
  });

  table.append(tbody);

  const footer = document.createElement('div');
  footer.className = 'offers-footer';
  const applyBtn = document.createElement('button');
  applyBtn.className = 'btn-create';
  applyBtn.textContent = 'Apply';
  applyBtn.addEventListener('click', () => {
    if (selectedOffer) {
      console.log('Selected offer:', selectedOffer);
      alert(`Offer "${selectedOffer.name}" selected — wire up to your workflow`);
    }
    overlay.remove();
  });
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-change';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => overlay.remove());
  footer.append(cancelBtn, applyBtn);

  panel.append(header, table, footer);
  overlay.append(panel);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.append(overlay);
}

const ACTIVITY_TYPES = [
  'A/B Test',
  'Automated Personalization',
  'Experience Targeting',
  'Multivariate Test',
  'Recommendations',
];

function renderActionBar() {
  const wrapper = document.createElement('div');
  wrapper.className = 'action-bar';

  const btn = document.createElement('button');
  btn.className = 'btn-create';
  btn.textContent = 'Create Activity';

  const flyout = document.createElement('ul');
  flyout.className = 'flyout hidden';
  ACTIVITY_TYPES.forEach((type) => {
    const li = document.createElement('li');
    li.textContent = type;
    li.addEventListener('click', () => {
      alert(`Create ${type} — hook this up to your workflow`);
      flyout.classList.add('hidden');
    });
    flyout.append(li);
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!btn.disabled) flyout.classList.toggle('hidden');
  });

  document.addEventListener('click', () => flyout.classList.add('hidden'));

  const changeBtn = document.createElement('button');
  changeBtn.className = 'btn-change hidden';
  changeBtn.textContent = 'Change Experience';
  changeBtn.addEventListener('click', async () => {
    const activity = changeBtn._activity;
    changeBtn.disabled = true;
    changeBtn.textContent = 'Loading offers…';
    try {
      const offers = await fetchOffers();
      showOffersModal(offers, activity);
    } catch (err) {
      alert(`Failed to load offers: ${err.message}`);
    } finally {
      changeBtn.disabled = false;
      changeBtn.textContent = 'Change Experience';
    }
  });

  wrapper.append(btn, flyout, changeBtn);

  wrapper.setSelected = (hasSelection, activity = null) => {
    btn.disabled = hasSelection;
    btn.classList.toggle('disabled', hasSelection);
    flyout.classList.add('hidden');
    changeBtn.classList.toggle('hidden', !hasSelection);
    changeBtn._activity = activity;
  };

  return wrapper;
}

function renderActivities(activities) {
  const container = document.createElement('div');
  container.className = 'activities';

  const heading = document.createElement('h2');
  heading.textContent = 'Target Activities';
  container.append(heading);

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th></th>
        <th>ID</th>
        <th>Name</th>
        <th>Type</th>
        <th>State</th>
        <th>Modified</th>
      </tr>
    </thead>
  `;

  const actionBar = renderActionBar();
  let selectedRow = null;

  const tbody = document.createElement('tbody');
  activities.forEach((a) => {
    const tr = document.createElement('tr');
    tr.className = 'activity-row';
    tr.innerHTML = `
      <td class="select-cell"><span class="radio"></span></td>
      <td>${a.id}</td>
      <td>${a.name}</td>
      <td>${a.type.toUpperCase()}</td>
      <td><span class="state state--${a.state}">${a.state}</span></td>
      <td>${formatDate(a.modifiedAt)}</td>
    `;
    tr.addEventListener('click', () => {
      if (selectedRow === tr) {
        tr.classList.remove('selected');
        selectedRow = null;
        actionBar.setSelected(false);
      } else {
        if (selectedRow) selectedRow.classList.remove('selected');
        tr.classList.add('selected');
        selectedRow = tr;
        actionBar.setSelected(true, a);
      }
    });
    tbody.append(tr);
  });

  table.append(tbody);
  container.append(table, actionBar);
  return container;
}

(async function init() {
  // DA SDK resolves only inside DA iframe; fall back gracefully when standalone
  const daContext = await Promise.race([
    DA_SDK,
    new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
  ]);
  if (daContext) {
    const { org, repo, path } = daContext.context;
    console.log(org, repo, path);
  }

  document.body.innerHTML = '<p class="loading">Loading Target activities…</p>';

  try {
    const activities = await fetchActivities();
    document.body.innerHTML = '';
    document.body.append(renderActivities(activities));
  } catch (err) {
    document.body.innerHTML = `<p class="error">${err.message}</p>`;
  }
}());
