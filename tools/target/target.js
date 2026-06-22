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

async function fetchActivities() {
  const resp = await fetch('https://332794-868ceruleanwhale.adobeioruntime.net/api/v1/web/default/target-activities');
  if (!resp.ok) {
    if (resp.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      await startOAuth();
      return [];
    }
    throw new Error(`Target API error: ${resp.status}`);
  }
  const { activities } = await resp.json();
  return activities ?? [];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ACTIVITY_TYPES = [
  'A/B Test',
  'Automated Personalization',
  'Experience Targeting',
  'Multivariate Test',
  'Recommendations',
];

function renderCreateFlyout() {
  const wrapper = document.createElement('div');
  wrapper.className = 'create-bar hidden';

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
    flyout.classList.toggle('hidden');
  });

  document.addEventListener('click', () => flyout.classList.add('hidden'));

  wrapper.append(btn, flyout);
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

  const createBar = renderCreateFlyout();
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
        createBar.classList.add('hidden');
      } else {
        if (selectedRow) selectedRow.classList.remove('selected');
        tr.classList.add('selected');
        selectedRow = tr;
        createBar.classList.remove('hidden');
      }
    });
    tbody.append(tr);
  });

  table.append(tbody);
  container.append(table, createBar);
  return container;
}

(async function init() {
  const { context, token: daToken } = await DA_SDK;
  const { org, repo, path } = context;
  console.log(org, repo, path);

  document.body.innerHTML = '<p class="loading">Authenticating…</p>';

  try {
    document.body.innerHTML = '<p class="loading">Loading Target activities…</p>';
    const activities = await fetchActivities();
    document.body.innerHTML = '';
    document.body.append(renderActivities(activities));
  } catch (err) {
    document.body.innerHTML = `<p class="error">${err.message}</p>`;
  }
}());
